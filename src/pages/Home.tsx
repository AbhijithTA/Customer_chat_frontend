export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to HelpDesk</h1>
      <p className="text-lg text-zinc-400 mb-6">Manage support tickets, chat with customers, and more.</p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400"
        >
          Login
        </a>
        <a
          href="/signup"
          className="border border-yellow-500 text-yellow-500 px-4 py-2 rounded hover:bg-yellow-500 hover:text-black"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
}
