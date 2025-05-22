<x-mail::message>
# 👋 Hello {{ $user->name }},

@if ($user->blocked_at)
## 🚫 Account Suspended

We regret to inform you that your account has been **suspended**.  
You no longer have access to the system.

If you believe this is a mistake, please contact our support team.

@else
## ✅ Account Activated

Your account has been **successfully activated**.  
You can now login and start using the system normally.

<x-mail::button :url="url('/login')">
🔐 Login to Your Account
</x-mail::button>
@endif

---

Thanks & Regards,  
**{{ config('app.name') }} Team**
</x-mail::message>
