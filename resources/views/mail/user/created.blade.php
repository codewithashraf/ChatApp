<x-mail::message>
# 🎉 Welcome to {{ config('app.name') }}, {{ $user->name }}!

Your account has been successfully created. We’re excited to have you on board.

---

## 🔐 Your Login Credentials:

**Email:** {{ $user->email }}  
**Password:** {{ $password }}

> For your security, please make sure to change your password after logging in.

<x-mail::button :url="url('/login')">
🔑 Login to Your Account
</x-mail::button>

If you face any issues, feel free to contact our support team.

Thanks again and welcome aboard!  
Best regards,  
**{{ config('app.name') }} Team**
</x-mail::message>
