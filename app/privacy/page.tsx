import type { Metadata } from 'next';
import { LEGAL, LegalPage, Sec } from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy · WellWheel' };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <Sec title="The short version">
        <ul className="checks">
          <li>Your journal, goals, gratitude list, and worksheets are private to you.</li>
          <li>If you connect with a partner, only the things you choose to share are shared with them.</li>
          <li>We don’t sell your information, and we don’t show ads.</li>
          <li>You can delete your account and everything in it at any time.</li>
        </ul>
      </Sec>

      <Sec title="Who we are">
        <p>WellWheel is an app made by {LEGAL.business}, based in {LEGAL.state}. In this policy, “we,” “us,” and “our” mean {LEGAL.business}. “You” means the person using WellWheel. This policy explains what information WellWheel collects, how we use it, and the choices you have.</p>
        <p>Questions? Email us at <a href={`mailto:${LEGAL.contact}`}>{LEGAL.contact}</a>.</p>
      </Sec>

      <Sec title="What we collect">
        <h3 className="h3" style={{ marginTop: 0 }}>Information you give us</h3>
        <ul>
          <li><b>Account details:</b> your name, username, email address, and password. Passwords are stored in scrambled (hashed) form; we can’t see them.</li>
          <li><b>What you create in the app:</b> goals and progress, journal entries, gratitude lines, worksheet answers, travel places, bucket lists, hobbies, and photos you add. Some of this can be personal, such as notes about your feelings, mental health, faith, relationships, or money. We treat all of it as private.</li>
          <li><b>Feedback:</b> anything you send through “Send feedback,” plus your email address if you choose “It’s OK to email me.”</li>
          <li><b>Codes and invites:</b> any Plus code you enter, and whether you joined through a friend’s invite link.</li>
        </ul>
        <h3 className="h3">Payment information</h3>
        <p>Payments for WellWheel Plus are handled by Stripe. We never see or store your full card number. Stripe tells us your subscription status and gives us customer and subscription ID numbers so we know whether you have Plus.</p>
        <h3 className="h3">Information collected automatically</h3>
        <ul>
          <li>Your device keeps you logged in using standard browser storage.</li>
          <li>When you send feedback, we include which screen you were on and your type of device and browser, to help fix problems.</li>
          <li>Our hosting and service providers keep basic technical logs (such as IP address and time of a request) for security and reliability.</li>
        </ul>
        <p>We don’t use advertising trackers or sell data to advertisers.</p>
      </Sec>

      <Sec title="How we use your information">
        <ul>
          <li>To run WellWheel: saving your entries, syncing them across your devices, and showing your progress.</li>
          <li>To send account emails, like confirming your email or resetting your password.</li>
          <li>To provide WellWheel Plus, apply codes, and give invite rewards.</li>
          <li>To share what you choose with a connected partner.</li>
          <li>To answer your feedback and improve the app.</li>
          <li>To keep WellWheel secure and to follow the law.</li>
        </ul>
        <p>Our team can technically reach the database that stores WellWheel. We only look at personal content when we need to keep the service working, respond to a request from you, or comply with the law.</p>
      </Sec>

      <Sec title="Couple connection: what your partner sees">
        <p>If you connect with a partner using a couple code, your partner can see:</p>
        <ul>
          <li>Goals either of you marks as shared, including who logged what.</li>
          <li>The couple’s bucket list and the Couples Communication Workbook.</li>
          <li>“Our plan” in the Financial Wellness Planner.</li>
          <li>The places you mark on your travel map, and photos of those places and of your couple’s bucket list.</li>
          <li>Your name and username.</li>
        </ul>
        <p>Your journal, gratitude list, unshared goals, other worksheets, personal bucket list, hobbies, and “My plan” stay private. If you disconnect, you each keep a private copy of what you shared.</p>
      </Sec>

      <Sec title="Who we share information with">
        <p>We don’t sell your personal information. We share it only with:</p>
        <ul>
          <li><b>Service providers</b> who help run WellWheel: Supabase (accounts, database, and photo storage), Vercel (website hosting), Stripe (payments), and Resend (account emails). The app also loads its fonts from Google Fonts. These providers may only use your information to provide their services to us.</li>
          <li><b>Your partner,</b> only as described above, and only if you connect.</li>
          <li><b>When required by law,</b> or to protect the safety, rights, or property of our users, the public, or us.</li>
          <li><b>If the business changes hands,</b> such as a sale or merger. We’d require the new owner to honor this policy.</li>
        </ul>
      </Sec>

      <Sec title="How long we keep it, and deleting your account">
        <p>We keep your information while your account is open. You can delete your account at any time in <b>Profile → Delete account</b>. That deletes your account, everything you created, and your photos. If you’re connected with a partner, we disconnect you first so your partner keeps their copy of what you shared.</p>
        <p>Deleted information may remain in secure backups for a short time before it’s erased. We may keep limited records when required by law, such as payment records kept by Stripe.</p>
      </Sec>

      <Sec title="Security">
        <p>We use encrypted connections, private storage, and access rules so each person can reach only their own information (and what a partner has shared). No system is perfectly secure, so please use a strong password and keep it private.</p>
      </Sec>

      <Sec title="Age requirement">
        <p>WellWheel is for people 18 and older. We don’t knowingly collect information from anyone under 18. If you believe someone under 18 has an account, contact us and we’ll delete it.</p>
      </Sec>

      <Sec title="Your choices and rights">
        <ul>
          <li>You can see, change, or delete most of your information right in the app.</li>
          <li>You can ask us for a copy of your information, to correct it, or to delete it by emailing <a href={`mailto:${LEGAL.contact}`}>{LEGAL.contact}</a>.</li>
          <li>Depending on where you live (including Texas), you may have additional rights under privacy laws. We’ll respond to requests as the law requires.</li>
        </ul>
      </Sec>

      <Sec title="Changes to this policy">
        <p>If we make important changes, we’ll update the date at the top and let you know in the app or by email. Using WellWheel after a change means you accept the updated policy.</p>
      </Sec>
    </LegalPage>
  );
}
