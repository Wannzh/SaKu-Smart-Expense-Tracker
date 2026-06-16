import { memo, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = memo(function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const validate = useMemo(() => {
    return () => {
      const errs = {};
      if (!form.email) {
        errs.email = "Email wajib diisi";
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errs.email = "Format email tidak valid";
      }
      if (!form.password) {
        errs.password = "Password wajib diisi";
      } else if (form.password.length < 6) {
        errs.password = "Password minimal 6 karakter";
      }
      return errs;
    };
  }, [form.email, form.password]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login gagal");
    } finally {
      setIsSubmitting(false);
    }
  }, [form.email, form.password, validate, login, navigate]);

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setIsSubmitting(true);
    try {
      const data = await loginWithGoogle(credentialResponse);
      const isNewUser = data?.data?.isNewUser;
      
      if (isNewUser) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // Error is toasted in the hook
    } finally {
      setIsSubmitting(false);
    }
  }, [loginWithGoogle, navigate]);

  const handleForgotPassword = useCallback((e) => {
    e.preventDefault();
    toast.success("Fitur segera hadir! Silakan hubungi admin.");
  }, []);

  return (
    <div className="min-h-screen bg-[#fcf8ff] dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600 rounded-full blur-[80px] md:blur-[120px] opacity-15 dark:opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-500 rounded-full blur-[80px] md:blur-[120px] opacity-10 dark:opacity-10" />
      </div>

      {/* Card */}
      <main className="w-full max-w-[440px] z-10 py-8">
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/50 dark:border-slate-800 shadow-xl rounded-2xl p-8 md:p-10 flex flex-col items-center">
          
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-gray-100 mb-3 shadow-lg shadow-gray-200/40 p-2">
              <img src="/saku.svg" className="w-full h-full object-contain" alt="SaKu Logo" />
            </div>
            <h1 className="text-3xl font-extrabold text-indigo-600 tracking-tight">
              SaKu
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Smart Expense Tracker</p>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 self-start">
            Masuk ke akun kamu
          </h2>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            
            {/* Email */}
            <div className="flex flex-col w-full">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full h-14 pl-12 pr-4 bg-[#f5f2ff] dark:bg-slate-800/50 border border-[#c7c4d8] dark:border-slate-700 rounded-xl focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/10 focus:outline-none text-[#1b1b24] dark:text-[#f3effc] placeholder:text-[#c7c4d8] dark:placeholder:text-slate-500 font-medium text-sm transition-all"
                />
              </div>
              {errors.email && (
                <span className="text-xs text-red-500 mt-1 flex items-center gap-1 px-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col w-full">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full h-14 pl-12 pr-12 bg-[#f5f2ff] dark:bg-slate-800/50 border border-[#c7c4d8] dark:border-slate-700 rounded-xl focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/10 focus:outline-none text-[#1b1b24] dark:text-[#f3effc] placeholder:text-[#c7c4d8] dark:placeholder:text-slate-500 font-medium text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-red-500 mt-1 flex items-center gap-1 px-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </span>
              )}
              
              {/* Lupa Kata Sandi */}
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline self-end mt-2"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-600/10 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-3 my-6">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              ATAU MASUK DENGAN
            </span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          </div>

          {/* Google Button */}
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Login Google gagal")}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="360px"
            />
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
});

export default LoginPage;
