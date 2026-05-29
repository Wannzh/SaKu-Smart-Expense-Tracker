import { memo, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import toast from "react-hot-toast";
import { Wallet } from "lucide-react";

const RegisterPage = memo(function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = useMemo(() => {
    return () => {
      const errs = {};
      if (!form.name.trim()) errs.name = "Nama wajib diisi";
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
  }, [form.name, form.email, form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registrasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-amber-50/30 px-4">
      <div className="w-full max-w-md animate-fade-slide-up">
        {/* Logo & Tagline */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 mb-4 shadow-lg shadow-indigo-200/60">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-indigo-600 tracking-tight">
            SaKu
          </h1>
          <p className="text-gray-400 text-sm mt-1">Smart Expense Tracker</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100/80 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Buat akun baru
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nama Lengkap"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              error={errors.name}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              error={errors.password}
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              {isLoading ? "Memproses..." : "Daftar"}
            </Button>
          </form>
        </div>

        {/* Link ke login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
});

export default RegisterPage;
