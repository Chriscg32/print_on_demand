from flask import Flask
import ssl

app = Flask(__name__)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('cert.pem', 'key.pem')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=443, ssl_context=context)