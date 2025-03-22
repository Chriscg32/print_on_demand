import logging
import watchtower
import boto3
from logging.handlers import RotatingFileHandler

def setup_logging(log_group="my-app-logs", log_stream="app-log-stream", region="us-east-1"):
    """
    Configures logging to send logs to AWS CloudWatch and a local file.
    
    Args:
        log_group: CloudWatch Log Group name
        log_stream: CloudWatch Log Stream name
        region: AWS region
    """
    # Initialize logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Clear old handlers (avoid duplication)
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # ✅ CloudWatch Handler
    session = boto3.Session(region_name=region)
    cloudwatch_handler = watchtower.CloudWatchLogHandler(
        log_group=log_group,
        stream_name=log_stream,
        use_queues=True,
        boto3_session=session
    )
    cloudwatch_handler.setFormatter(formatter)
    logger.addHandler(cloudwatch_handler)

    # ✅ Local File Logging (Backup)
    file_handler = RotatingFileHandler("logs/app.log", maxBytes=10*1024*1024, backupCount=5)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    logging.info("🚀 Logging configured: Sending logs to AWS CloudWatch + local file")

# Initialize Logging
setup_logging()

# Example logs
logging.info("This is an info message")
logging.warning("This is a warning message")
logging.error("This is an error message")
