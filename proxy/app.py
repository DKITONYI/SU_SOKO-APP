import base64
import os
from datetime import datetime

import firebase_admin
import requests
from dotenv import load_dotenv
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request
from flask_cors import CORS
from requests.auth import HTTPBasicAuth

load_dotenv()

app = Flask(__name__)
CORS(app)

SERVICE_ACCOUNT_PATH = os.environ.get(
    "FIREBASE_SERVICE_ACCOUNT_PATH",
    "serviceAccountKey.json",
)

if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

DARAJA_CONSUMER_KEY = os.environ.get("DARAJA_CONSUMER_KEY")
DARAJA_CONSUMER_SECRET = os.environ.get("DARAJA_CONSUMER_SECRET")
DARAJA_PASSKEY = os.environ.get("DARAJA_PASSKEY")
DARAJA_SHORTCODE = os.environ.get("DARAJA_SHORTCODE", "174379")
DARAJA_ENV = os.environ.get("DARAJA_ENV", "sandbox")
DARAJA_CALLBACK_URL = os.environ.get("DARAJA_CALLBACK_URL")

BASE_URL = (
    "https://api.safaricom.co.ke"
    if DARAJA_ENV == "production"
    else "https://sandbox.safaricom.co.ke"
)


def require_env(name, value):
    if not value:
        raise RuntimeError(f"{name} is not configured.")


def get_mpesa_token():
    require_env("DARAJA_CONSUMER_KEY", DARAJA_CONSUMER_KEY)
    require_env("DARAJA_CONSUMER_SECRET", DARAJA_CONSUMER_SECRET)

    endpoint = f"{BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(
        endpoint,
        auth=HTTPBasicAuth(DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET),
        timeout=10,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def metadata_value(metadata, name):
    for item in metadata.get("Item", []):
        if item.get("Name") == name:
            return item.get("Value")
    return None


def normalize_phone(phone_number):
    cleaned = "".join(char for char in str(phone_number) if char.isdigit())

    if cleaned.startswith("0") and len(cleaned) == 10:
        return f"254{cleaned[1:]}"

    if cleaned.startswith("254") and len(cleaned) == 12:
        return cleaned

    raise ValueError("Invalid Safaricom phone number.")


@app.get("/health")
def health():
    return jsonify({"ok": True}), 200


@app.post("/mpesa/stk-push")
@app.post("/api/stkpush")
def initiate_stk_push():
    try:
        data = request.get_json(force=True) or {}
        payment_id = data.get("paymentId")
        user_id = data.get("userId")
        phone_number = normalize_phone(data.get("phoneNumber"))
        amount = int(float(data.get("amount", 0)))
        purpose = data.get("purpose")
        product_id = data.get("productId", "")
        seller_id = data.get("sellerId", "")

        if not payment_id or not user_id or not amount or not purpose:
            return jsonify({"error": "Missing required payment fields."}), 400

        require_env("DARAJA_PASSKEY", DARAJA_PASSKEY)
        require_env("DARAJA_CALLBACK_URL", DARAJA_CALLBACK_URL)

        token = get_mpesa_token()
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(
            f"{DARAJA_SHORTCODE}{DARAJA_PASSKEY}{timestamp}".encode()
        ).decode("utf-8")

        payload = {
            "BusinessShortCode": DARAJA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": DARAJA_SHORTCODE,
            "PhoneNumber": phone_number,
            "CallBackURL": DARAJA_CALLBACK_URL,
            "AccountReference": "SU-SOKO-SUB"
            if purpose == "seller_subscription"
            else "SU-SOKO-BUY",
            "TransactionDesc": "SU SOKO seller subscription"
            if purpose == "seller_subscription"
            else "SU SOKO product purchase",
        }

        response = requests.post(
            f"{BASE_URL}/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            timeout=15,
        )
        stk_data = response.json()

        if response.status_code >= 400 or stk_data.get("ResponseCode") != "0":
            db.collection("payments").document(payment_id).set(
                {
                    "status": "failed",
                    "daraja_response": stk_data,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                },
                merge=True,
            )
            return jsonify({"error": "Daraja rejected request.", "details": stk_data}), 400

        db.collection("payments").document(payment_id).set(
            {
                "user_id": user_id,
                "phone_number": phone_number,
                "amount": amount,
                "purpose": purpose,
                "product_id": product_id,
                "seller_id": seller_id,
                "checkout_request_id": stk_data.get("CheckoutRequestID", ""),
                "merchant_request_id": stk_data.get("MerchantRequestID", ""),
                "status": "stk_sent",
                "updated_at": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )

        return jsonify(
            {
                "checkoutRequestId": stk_data.get("CheckoutRequestID"),
                "merchantRequestId": stk_data.get("MerchantRequestID"),
                "responseCode": stk_data.get("ResponseCode"),
                "responseDescription": stk_data.get("ResponseDescription"),
                "customerMessage": stk_data.get("CustomerMessage"),
            }
        ), 200
    except Exception as exc:
        app.logger.exception("STK push failed")
        return jsonify({"error": str(exc)}), 500


@app.post("/mpesa/callback")
@app.post("/api/mpesa-callback")
def mpesa_callback():
    try:
        payload = request.get_json(force=True) or {}
        callback = payload.get("Body", {}).get("stkCallback", {})
        checkout_request_id = callback.get("CheckoutRequestID")

        if not checkout_request_id:
            return jsonify({"ResultCode": 1, "ResultDesc": "Invalid callback"}), 400

        payments = (
            db.collection("payments")
            .where("checkout_request_id", "==", checkout_request_id)
            .limit(1)
            .stream()
        )
        payment_doc = next(payments, None)

        if payment_doc is None:
            app.logger.warning("No payment found for %s", checkout_request_id)
            return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200

        payment_ref = payment_doc.reference
        payment = payment_doc.to_dict()
        result_code = callback.get("ResultCode")
        result_desc = callback.get("ResultDesc", "")

        if result_code != 0:
            payment_ref.set(
                {
                    "status": "failed",
                    "result_code": result_code,
                    "failure_reason": result_desc,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                },
                merge=True,
            )
            return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200

        metadata = callback.get("CallbackMetadata", {})
        receipt = metadata_value(metadata, "MpesaReceiptNumber")
        paid_amount = metadata_value(metadata, "Amount")
        paid_phone = metadata_value(metadata, "PhoneNumber")

        batch = db.batch()
        batch.set(
            payment_ref,
            {
                "status": "paid",
                "mpesa_receipt_number": receipt,
                "paid_amount": paid_amount,
                "paid_phone": paid_phone,
                "result_code": result_code,
                "result_description": result_desc,
                "paid_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )

        if payment.get("purpose") == "seller_subscription":
            batch.set(
                db.collection("users").document(payment["user_id"]),
                {
                    "subscription_status": "active",
                    "subscription_updated_at": firestore.SERVER_TIMESTAMP,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                },
                merge=True,
            )

        if payment.get("purpose") == "product_purchase" and payment.get("product_id"):
            batch.set(
                db.collection("products").document(payment["product_id"]),
                {
                    "status": "sold",
                    "buyer_id": payment.get("user_id", ""),
                    "sold_at": firestore.SERVER_TIMESTAMP,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                },
                merge=True,
            )

        batch.commit()
        return jsonify({"ResultCode": 0, "ResultDesc": "Callback handled successfully"}), 200
    except Exception as exc:
        app.logger.exception("Callback failed")
        return jsonify({"ResultCode": 1, "ResultDesc": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
