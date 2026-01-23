import bonjour from "bonjour";

export function advertise(port) {
  const b = bonjour();
  b.publish({
    name: "button-board",
    type: "http",
    port,
  });

  console.log(`mDNS advertising: button-board.local:${port}`);
}
