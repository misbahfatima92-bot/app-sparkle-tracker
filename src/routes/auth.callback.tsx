function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/", replace: true });
      } else {
        supabase.auth.exchangeCodeForSession(window.location.search).then(({ data }) => {
          if (data.session) navigate({ to: "/", replace: true });
          else navigate({ to: "/login", replace: true });
        });
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400">Logging you in...</p>
    </div>
  );
}
