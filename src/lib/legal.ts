/**
 * Datele afișate public în footer, cerute pentru comerț online în România
 * (OUG 34/2014, Legea 365/2002). Vânzătorul e entitatea responsabilă legal
 * pentru retururi și reclamații; producătorul e listat separat, ca informație.
 */

export const SELLER = {
  name: "Din Viitor S.R.L.",
  cui: "RO37925510",
  regCom: "J40/11712/2017",
  address: "Str. Giovanni Boccaccio 85, Anexa 1, Sector 4, București, România",
  /**
   * Adresă de pe domeniul propriu, cu redirect către inboxul real — ca să nu
   * publicăm o adresă personală. Trebuie să funcționeze înainte de lansare:
   * fără redirectul configurat, clienții scriu în gol.
   */
  email: "contact@tricouamenda.ro",
};

export const MANUFACTURER = {
  name: "Think DTG Production SRL",
  phone: "+40 773 842 909",
};

export const RETURNS = {
  windowDays: 14,
  note: "Produsul trebuie să fie nepurtat și în ambalajul original. Contactează-ne înainte de a trimite coletul.",
};

/**
 * Pictogramele ANPC. Descarcă-le de pe anpc.ro (250×50 px) și pune-le în
 * public/legal/ cu numele de mai jos — dacă lipsesc, se afișează linkuri text,
 * care rămân funcționale dar nu respectă cerința de pictogramă.
 *
 * SAL e cert obligatoriu. SOL trimitea către platforma europeană ODR, închisă
 * definitiv la 20 iulie 2025 prin Regulamentul (UE) 2024/3228 — linkul duce
 * acum într-o pagină moartă, așa că e dezactivat implicit. Confirmă cu
 * contabilul sau juristul înainte de a-l reactiva.
 */
export const ANPC_LINKS = {
  sal: {
    enabled: true,
    label: "ANPC · SAL",
    href: "https://anpc.ro/ce-este-sal/",
    image: "/legal/anpc-sal.png",
  },
  sol: {
    enabled: false,
    label: "ANPC · SOL",
    href: "https://ec.europa.eu/consumers/odr",
    image: "/legal/anpc-sol.png",
  },
};
