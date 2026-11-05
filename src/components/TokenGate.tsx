import { BRAND } from "../config";
import { Logo } from "./Icons";

type Problem = "missing" | "secret" | "rejected";

const COPY: Record<Problem, { title: string; body: string }> = {
  missing: {
    title: "Add your Mapbox token to see the map",
    body: "The map needs a free public access token. It takes about a minute.",
  },
  secret: {
    title: "That's a secret token. Use a public one",
    body: "Secret tokens (sk.…) must never go in front-end code. Create or copy a public token that starts with pk.",
  },
  rejected: {
    title: "Mapbox rejected your token",
    body: "Check that it's a public token (pk.…), that it has no typos and that its URL restrictions allow this address.",
  },
};

export default function TokenGate({ problem }: { problem: Problem }) {
  const { title, body } = COPY[problem];
  return (
    <main className="gate">
      <div className="gate__card">
        <Logo size={40} />
        <h1>{title}</h1>
        <p>{body}</p>
        <ol>
          <li>
            Open <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer">account.mapbox.com</a> and
            copy your default public token.
          </li>
          <li>
            Copy <code>.env.example</code> to <code>.env</code> and paste the token:
            <pre>VITE_MAPBOX_TOKEN=pk.your_token_here</pre>
          </li>
          <li>
            Stop and restart <code>npm run dev</code>. Vite reads <code>.env</code> only at startup.
          </li>
        </ol>
        <p className="gate__foot">
          {BRAND.product} by <a href={BRAND.links.youtube} target="_blank" rel="noreferrer">{BRAND.name}</a>
        </p>
      </div>
    </main>
  );
}
