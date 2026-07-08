import packageJson from "@/package.json";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/80 px-4 py-4 text-center text-xs text-zinc-500 backdrop-blur-md sm:px-6">
      <div className="mx-auto max-w-6xl">
        <span>Version {packageJson.version}</span>
      </div>
    </footer>
  );
}
