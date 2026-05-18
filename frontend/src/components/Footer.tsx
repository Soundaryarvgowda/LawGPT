export default function Footer() {
  return (
    <footer className="w-full py-8 border-t border-slate-800 mt-auto text-center">
      <p className="text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} LawGPT. All rights reserved. Premium AI Legal Research.
      </p>
    </footer>
  );
}
