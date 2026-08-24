export type ShopInboxes = {
  owner: string[];
  workshop: string[];
  recipients: string[];
};

function uniqueAddresses(...addresses: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const address of addresses) {
    const key = address.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(address);
  }
  return unique;
}

function looksLikeEmail(address: string): boolean {
  const at = address.indexOf("@");
  return at > 0 && at < address.length - 1 && !address.includes(" ");
}

function parseAddressList(value: string | undefined, name: string): string[] {
  if (!value?.trim()) return [];
  const parsed = uniqueAddresses(
    ...value
      .split(/[,;]+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
  );
  const invalid = parsed.filter((address) => !looksLikeEmail(address));
  if (invalid.length > 0) {
    throw new Error(`${name} conține adrese invalide.`);
  }
  return parsed;
}

/** Inbox magazin + atelier. Contact și comenzi merg la toate adresele. */
export function readShopInboxes(): ShopInboxes {
  const workshop = parseAddressList(process.env.PROVIDER_EMAIL, "PROVIDER_EMAIL");
  const owner = parseAddressList(process.env.CONTACT_FORWARD_TO, "CONTACT_FORWARD_TO");
  if (workshop.length === 0 || owner.length === 0) {
    const missing = [
      workshop.length === 0 ? "PROVIDER_EMAIL" : null,
      owner.length === 0 ? "CONTACT_FORWARD_TO" : null,
    ].filter((item): item is string => item !== null);
    throw new Error(`Configurație incompletă: ${missing.join(", ")} lipsesc.`);
  }

  return {
    owner,
    workshop,
    recipients: uniqueAddresses(...workshop, ...owner),
  };
}
