// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center text-white max-w-2xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-6">Chartreuse</h1>
        <p className="text-xl mb-8 text-white/90">
          Your intelligent mutual fund and SIP investment companion
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/login" className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors">
            Login
          </a>
          <a href="/signup" className="border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
