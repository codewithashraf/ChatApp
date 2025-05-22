<x-mail::message>
# 👋 Hello {{ $user->name }},

@if ($user->is_admin)
## 🛠️ You are now an Admin!

Congratulations! 🎉  
Your role has been updated to **Admin**.

You now have permission to:

- ✅ Add new users  
- ✅ Block existing users  
- ✅ Manage system settings

Use your new powers wisely! 💼

@else
## 🙋 You are now a Regular User

Your role has been changed to **Regular User**.

You no longer have access to:

- ❌ Adding users  
- ❌ Blocking users  
- ❌ Admin settings

If you have any concerns, please contact your administrator.
@endif

---

Thanks & Regards,  
**{{ config('app.name') }} Team**
</x-mail::message>
