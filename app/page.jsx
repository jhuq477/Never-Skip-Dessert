import AuthForm from "./components/AuthForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50 p-8">
        <h1 className="text-3xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
          Welcome to Never Skip Dessert
        </h1>
        <div className="bg-gray-700/30 p-4 rounded-lg mb-6">
          <p className="text-gray-300 text-center">
            Track your calories and protein to hit your weight goals with confidence—no guesswork, just results.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-600/50">
            <p className="text-center text-sm text-blue-300">
              Just use your email to sign in, no password required!
            </p>
          </div>
        </div>
        <div className="mt-4">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}