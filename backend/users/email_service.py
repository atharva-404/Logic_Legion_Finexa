"""
Email service for sending verification and password reset emails.
Uses Django's email backend with SMTP configuration.
"""

from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_email_verification(user, verification_token, domain='http://localhost:3000'):
    """
    Send email verification link to user.
    
    Args:
        user: User object
        verification_token: Generated token for email verification
        domain: Frontend domain for verification link
    
    Returns:
        bool: True if email sent successfully
    """
    verification_link = f"{domain}/verify-email?token={verification_token}"
    
    subject = "Verify Your Email - Finexa"
    html_message = f"""
    <h2>Welcome to Finexa!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="{verification_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Verify Email
    </a></p>
    <p>Or copy this link: <code>{verification_link}</code></p>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't create this account, please ignore this email.</p>
    """
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
        return False


def send_password_reset_email(user, reset_token, domain='http://localhost:3000'):
    """
    Send password reset link to user.
    
    Args:
        user: User object
        reset_token: Generated token for password reset
        domain: Frontend domain for reset link
    
    Returns:
        bool: True if email sent successfully
    """
    reset_link = f"{domain}/reset-password?token={reset_token}"
    
    subject = "Reset Your Password - Finexa"
    html_message = f"""
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Click the link below to proceed:</p>
    <p><a href="{reset_link}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
    </a></p>
    <p>Or copy this link: <code>{reset_link}</code></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
    """
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending password reset email: {str(e)}")
        return False


def send_welcome_email(user):
    """
    Send welcome email after successful registration.
    
    Args:
        user: User object
    
    Returns:
        bool: True if email sent successfully
    """
    subject = "Welcome to Finexa!"
    html_message = f"""
    <h2>Welcome, {user.username}!</h2>
    <p>Thank you for joining Finexa.</p>
    <p>You can now log in and start managing your finances.</p>
    <p>If you have any questions, feel free to contact our support team.</p>
    <p>Happy tracking!</p>
    """
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending welcome email: {str(e)}")
        return False
