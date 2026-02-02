export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--card-bg)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © 2026 Kite. Send value to anyone. Just type a name.
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <a
              href="https://docs.li.fi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Powered by LI.FI
            </a>
            <a
              href="https://ens.domains"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              ENS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}