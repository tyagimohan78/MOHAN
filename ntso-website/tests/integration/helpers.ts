import { SMTPServer } from "smtp-server";
import { simpleParser, type ParsedMail } from "mailparser";
import type { AddressInfo } from "node:net";

/** In-process SMTP server that records delivered messages. */
export async function startSmtpSink() {
  const messages: ParsedMail[] = [];
  const server = new SMTPServer({
    authOptional: true,
    disabledCommands: ["STARTTLS"],
    onAuth(_auth, _session, cb) {
      cb(null, { user: "test" });
    },
    onData(stream, _session, cb) {
      simpleParser(stream)
        .then((m) => {
          messages.push(m);
          cb();
        })
        .catch(cb);
    },
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.server.address() as AddressInfo).port;
  return { port, messages, close: () => new Promise<void>((r) => server.close(() => r())) };
}
