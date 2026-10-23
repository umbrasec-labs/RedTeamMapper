# Red Team Mapper v3.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ![Theme](https://img.shields.io/badge/theme-charcoal%20%2F%20orange-F25623)
   

**Comprehensive visual reference & attack path mapper for red team, purple team, and adversary emulation operations.**

A single-page, interactive red team dashboard mapping the full offensive lifecycle:
Initial Access → Execution → Persistence → Privilege Escalation → Defense Evasion → Credential Access → Discovery → Lateral Movement → Collection → Exfiltration → Impact

Built as a static HTML/CSS site on a charcoal and orange palette.

**Live version:**  
https://umbrasec-labs.github.io/RedTeamMapper/

**Companion project:**  
[Blue Team Mapper](https://umbrasec-labs.github.io/BlueTeamMapper/) - the defensive counterpart.

## Why This Exists
Red vs Blue is most effective when both sides speak the same language.  
This mapper gives red teamers, purple teamers, and adversary emulation operators a clean, visual blueprint of every major attack path - so defenders know exactly what to hunt for and how to stop it.

## Features
- Sticky sidebar navigation with scroll-spy - jump to any phase instantly
- 7-phase kill chain lifecycle bar (Infrastructure → Initial Access → Execution → Evasion → Lateral/Persist → Collection → Exfiltration)
- 19 end-to-end operation flow chains (phishing → DA, MFA bypass → cloud, ADCS ESC4, BadSuccessor, device code, WDAC kill, etc.)
- Callout boxes for critical OPSEC warnings, EDR detection layers, and high-risk actions
- Detailed sections covering:
  - C2 frameworks deep dive (Cobalt Strike, Havoc, Sliver, Mythic, Brute Ratel, covert channels)
  - Red team infrastructure (redirectors, Malleable C2 profiles, IaC automation)
  - Initial access vectors (HTML smuggling, AitM/EvilGinx, device code phishing, ClickFix, macro-less payloads)
  - Payload development (shellcode generation, loaders, DLL sideloading, LOLBins, advanced PIC compilation)
  - Defense evasion (AMSI/ETW bypass, direct/indirect syscalls, sleep obfuscation, unhooking, call stack spoofing, EDR-specific bypasses)
  - Process injection (threadless injection, early cascade, module stomping, APC/thread pool)
  - Persistence mechanisms (COM hijacking, scheduled tasks, WMI events, DLL sideload persistence)
  - Credential access (evasive LSASS dumping, DPAPI/browser harvesting, Kerberos ticket theft, all-in-one tools)
  - Lateral movement (SCShell, DCOM, token impersonation, C2 pivoting, Pass-the-Hash/Ticket/Certificate)
  - Exfiltration & data staging (HTTPS C2, DNS exfil, cloud storage abuse)
  - OPSEC (detection risk matrix, MDI/identity evasion, canary token detection, network OPSEC)
  - Privilege escalation (BYOVD, BadSuccessor, NTLM reflection, RBCD, KrbRelayUp)
  - Active Directory attacks (ADCS ESC1-ESC15, Shadow Credentials, DCSync, vSphere snapshot extraction)
  - MOTW bypass & delivery (LNK chains, polyglot files, SmartScreen bypass, MSI/MST weaponization)
  - Social engineering & vishing (CID spoofing infra, voice cloning, ClickFix/pastejacking, QR phishing, trusted platform abuse)
  - Cloud attack operations (Azure/Entra ID, CAP bypass, AWS SSO, on-prem to cloud pivoting)
  - Notable CVEs 2025
  - macOS & Linux red teaming
  - AI-assisted operations (LLM jailbreaking, AI C2, deepfakes, autonomous agents)
  - OSINT & reconnaissance
  - Password cracking infrastructure
  - Full tool arsenal reference


## Tech Stack

-  HTML5 + CSS + JavaScript (vanilla, no frameworks)
- Google Fonts: **Syne** (headings) + **IBM Plex Sans** (body) + **JetBrains Mono** (code/mono)
- CSS variable design system (charcoal / orange palette)
- IntersectionObserver API for sidebar scroll-spy

## Palette (charcoal / orange)

Surfaces, text and borders are the umbrasec.dev palette. The accent
variables keep their historical names and carry a muted eight-hue coding
set (orange, gold, khaki, sage, teal, slate, mauve, rose) so categories and
severities stay distinguishable on charcoal.

```css
:root {
  --bg:           #171717;
  --bg-card:      #222222;
  --bg-raised:    #2a2a2a;
  --bg-hover:     #2a2a2a;
  --border:       #525252;
  --border-dim:   #2a2a2a;
  --text:         #959c95;
  --text-bright:  #ccd0cf;
  --text-dim:     #7d837d;
  --text-muted:   #686c69;
  --red:          #f25623;   /* orange: critical, primary accent */
  --rose:         #e07a8a;   /* rose: opsec, vishing */
  --orange:       #d9a441;   /* gold: high, access, credentials */
  --yellow:       #d9a441;
  --green:        #88a57d;   /* sage: low, phishing, social */
  --cyan:         #5fb3a1;   /* teal: lateral, persistence, linux */
  --teal:         #5fb3a1;
  --blue:         #8fa3b8;   /* slate: infra, cloud */
  --purple:       #b48ead;   /* mauve: c2, injection, tools */
  --pink:         #b48ead;
}
/* medium severity: khaki #aeab94 */
```
## Changelog

### v3.0
- Added sticky sidebar navigation (260px) with grouped phase categories and IntersectionObserver scroll-spy
- Replaced SVG kill chain architecture diagram with clean 7-phase lifecycle bar
- Rewrote all operation flow chains as card-based layout with labeled arrows
- Added Syne 800 as heading font; increased base font to 14px / line-height 1.75
- Added callout boxes (danger/warn/info) for critical OPSEC warnings and EDR detection guidance
- Extended CSS variable set with `--bg-card`, `--bg-raised`, `--bg-hover`, `--border-dim`, `--text-muted`
- Card accent bars (2px colored top-border per phase)
- New content: BadSuccessor, NTLM reflection CVE-2025-33073, AI-driven C2, MDI evasion, ClickFix, ClickFix vishing, QR phishing, vSphere credential extraction, Cloud CAP bypass, and more

### v2.0
- Initial public release
