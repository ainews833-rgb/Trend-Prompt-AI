/**
 * Email Validation & Anti-Fake Email Defense Engine
 * Protects TrendPrompt AI against disposable domains, gibberish patterns,
 * temporary inboxes, and fraudulent registrations.
 */

export interface EmailValidationResult {
  isValid: boolean;
  isFake: boolean;
  reason?: string;
  domain: string;
  providerType: "reputable" | "standard" | "disposable" | "suspicious";
  detectedService?: string;
  confidenceScore: number; // 0 (definitely fake) to 100 (high confidence genuine)
}

// Extensive blacklist of disposable, temporary, and throwaway mail services
const DISPOSABLE_DOMAINS = new Set([
  // Popular temporary email generators
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "10minutemail.com",
  "10minutemail.net",
  "10mail.org",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "guerrillamail.net",
  "guerrillamail.biz",
  "guerrillamail.org",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "dispostable.com",
  "getairmail.com",
  "fakemailgenerator.com",
  "mohmal.com",
  "burnermail.io",
  "crazymailing.com",
  "generator.email",
  "inboxkitten.com",
  "maildrop.cc",
  "nada.ltd",
  "tempail.com",
  "zillamail.com",
  "emailondeck.com",
  "fakeinbox.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "mytemp.email",
  "dropmail.me",
  "tempr.email",
  "discard.email",
  "spambog.com",
  "tempmailaddress.com",
  "disposablemail.com",
  "tmail.com",
  "byom.de",
  "mailnesia.com",
  "tempmail.ninja",
  "emailfake.com",
  "fakeemail.net",
  "tempmailo.com",
  "internxt.com",
  "minutemailbox.com",
  "burnermail.org",
  "fastmail.fm", // frequently abused temp variants
  "harakirimail.com",
  "jetable.org",
  "kasmail.com",
  "mytrashmail.com",
  "nomail.xl.cx",
  "nospam.ze.tc",
  "owlpic.com",
  "pookmail.com",
  "shortmail.net",
  "sofort-mail.de",
  "spamavert.com",
  "spambox.us",
  "spamfree24.org",
  "spamgourmet.com",
  "spamhole.com",
  "temporaryemail.net",
  "temporaryinbox.com",
  "trashymail.com",
  "wuzupmail.net",
  "zippymail.info",
  "deadaddress.com",
  "e4ward.com",
  "emailias.com",
  "incognitomail.org",
  "sneakemail.com",
  "mintemail.com",
  "spamex.com",
  "inorbit.com",
  "safetymail.info",
  "mailnull.com",
  "zoemail.org",
  "anonymouse.org",
]);

// Known fake / test domains people use to bypass signup
const BOGUS_DOMAINS = new Set([
  "test.com",
  "fake.com",
  "fakeemail.com",
  "example.com",
  "example.org",
  "example.net",
  "domain.com",
  "sample.com",
  "asdf.com",
  "qwerty.com",
  "xyz.com",
  "abc.com",
  "none.com",
  "noemail.com",
  "invalid.com",
  "random.com",
  "nomail.com",
  "mail.com", // Often used by bogus bots
]);

// Reputable known genuine email providers
const REPUTABLE_DOMAINS: Record<string, string> = {
  "gmail.com": "Google",
  "googlemail.com": "Google",
  "outlook.com": "Microsoft Outlook",
  "hotmail.com": "Microsoft Hotmail",
  "live.com": "Microsoft Live",
  "yahoo.com": "Yahoo Mail",
  "icloud.com": "Apple iCloud",
  "me.com": "Apple iCloud",
  "mac.com": "Apple iCloud",
  "proton.me": "Proton Mail",
  "protonmail.com": "Proton Mail",
  "zoho.com": "Zoho Mail",
  "aol.com": "AOL",
  "gmx.com": "GMX",
  "gmx.de": "GMX",
  "web.de": "Web.de",
  "yandex.com": "Yandex",
};

// Gibberish / fake prefix patterns
const FAKE_USERNAMES = [
  "test",
  "fake",
  "asdf",
  "asdfgh",
  "qwerty",
  "qwertyuiop",
  "12345",
  "123456",
  "11111",
  "aaaaa",
  "zzzzz",
  "dummy",
  "sample",
  "trash",
  "spam",
  "nobody",
  "null",
  "undefined",
  "noname",
  "noemail",
];

// In-memory verification codes store for optional email ownership verification
const VERIFICATION_CODES = new Map<string, { code: string; expiresAt: number }>();

export class EmailValidationService {
  /**
   * Validate an email against fake email patterns, disposable domains, and gibberish.
   */
  public static validate(email: string): EmailValidationResult {
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return {
        isValid: false,
        isFake: true,
        reason: "Email address cannot be empty.",
        domain: "",
        providerType: "suspicious",
        confidenceScore: 0,
      };
    }

    // RFC 5322 compliant regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(cleanEmail)) {
      return {
        isValid: false,
        isFake: true,
        reason: "Invalid email format. Please check the '@' and domain extension.",
        domain: "",
        providerType: "suspicious",
        confidenceScore: 0,
      };
    }

    const [localPart, domain] = cleanEmail.split("@");

    if (!localPart || !domain) {
      return {
        isValid: false,
        isFake: true,
        reason: "Malformed email address.",
        domain: domain || "",
        providerType: "suspicious",
        confidenceScore: 0,
      };
    }

    // 1. Check if domain is in disposable temporary mail blacklist
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return {
        isValid: false,
        isFake: true,
        reason: `Disposable temporary email detected (${domain}). Disposable email addresses are strictly blocked to protect accounts.`,
        domain,
        providerType: "disposable",
        detectedService: "Disposable / Burner Email",
        confidenceScore: 5,
      };
    }

    // 2. Check if domain is in bogus / dummy domains
    if (BOGUS_DOMAINS.has(domain)) {
      return {
        isValid: false,
        isFake: true,
        reason: `Testing or dummy domain detected (@${domain}). Please provide a genuine email.`,
        domain,
        providerType: "disposable",
        detectedService: "Bogus Domain",
        confidenceScore: 10,
      };
    }

    // 3. TLD validation
    const domainParts = domain.split(".");
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || /^[0-9]+$/.test(tld)) {
      return {
        isValid: false,
        isFake: true,
        reason: `Invalid top-level domain (.${tld}).`,
        domain,
        providerType: "suspicious",
        confidenceScore: 15,
      };
    }

    const invalidTlds = new Set(["fake", "test", "invalid", "localhost", "example", "temp"]);
    if (invalidTlds.has(tld)) {
      return {
        isValid: false,
        isFake: true,
        reason: `Unsupported dummy extension (.${tld}).`,
        domain,
        providerType: "disposable",
        confidenceScore: 10,
      };
    }

    // 4. Gibberish username checks
    if (FAKE_USERNAMES.includes(localPart)) {
      return {
        isValid: false,
        isFake: true,
        reason: `Generic or placeholder username '${localPart}' detected. Please use your real email.`,
        domain,
        providerType: "suspicious",
        confidenceScore: 20,
      };
    }

    // Consonant-only gibberish check (e.g., 'dfghjklm@gmail.com')
    if (localPart.length > 5 && !/[aeiouy0-9]/.test(localPart)) {
      return {
        isValid: false,
        isFake: true,
        reason: "Randomized gibberish characters detected in email address.",
        domain,
        providerType: "suspicious",
        confidenceScore: 25,
      };
    }

    // Excessive repeating characters (e.g., 'aaaaaa@gmail.com')
    if (/([a-z0-9])\1{4,}/.test(localPart)) {
      return {
        isValid: false,
        isFake: true,
        reason: "Excessive repeating characters detected in email address.",
        domain,
        providerType: "suspicious",
        confidenceScore: 30,
      };
    }

    // 5. Reputable Provider detection
    if (REPUTABLE_DOMAINS[domain]) {
      return {
        isValid: true,
        isFake: false,
        domain,
        providerType: "reputable",
        detectedService: REPUTABLE_DOMAINS[domain],
        confidenceScore: 98,
      };
    }

    // Educational or Government verified domains
    if (domain.endsWith(".edu") || domain.endsWith(".ac.uk") || domain.endsWith(".gov")) {
      return {
        isValid: true,
        isFake: false,
        domain,
        providerType: "reputable",
        detectedService: "Institutional / University",
        confidenceScore: 99,
      };
    }

    // Standard business or custom domain
    return {
      isValid: true,
      isFake: false,
      domain,
      providerType: "standard",
      detectedService: "Verified Custom Domain",
      confidenceScore: 85,
    };
  }

  /**
   * Request a 6-digit confirmation code for email verification.
   * Prevents anyone from registering someone else's or an unverified email.
   */
  public static requestVerificationCode(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    VERIFICATION_CODES.set(email.toLowerCase(), { code, expiresAt });
    return code;
  }

  /**
   * Verify the 6-digit code.
   */
  public static verifyCode(email: string, inputCode: string): boolean {
    const record = VERIFICATION_CODES.get(email.toLowerCase());
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      VERIFICATION_CODES.delete(email.toLowerCase());
      return false;
    }
    if (record.code === inputCode.trim()) {
      VERIFICATION_CODES.delete(email.toLowerCase());
      return true;
    }
    return false;
  }
}
