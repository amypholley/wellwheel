import type { Metadata } from 'next';
import { LEGAL, LegalPage, Sec } from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Terms of Service · WellWheel' };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <Sec title="Welcome to WellWheel">
        <p>These terms are an agreement between you and {LEGAL.business} (“we,” “us,” “our”) about using WellWheel. By creating an account or using WellWheel, you agree to these terms and to our <a href="/privacy">Privacy Policy</a>. If you don’t agree, please don’t use WellWheel.</p>
      </Sec>

      <Sec title="Who can use WellWheel">
        <p>You must be 18 or older. You’re responsible for keeping your password private and for what happens in your account. Give us accurate information, and tell us if you think someone else has used your account.</p>
      </Sec>

      <Sec title="WellWheel is not medical, mental health, or financial advice">
        <p>WellWheel offers tools for goals, journaling, and reflection, including worksheets about emotions, coping, stress, and money. These are for general wellness and education only. They are not medical, psychological, or financial advice, and they don’t replace a doctor, therapist, counselor, or financial professional. Talk with a qualified professional about your own situation.</p>
        <p className="note"><b>If you’re in crisis</b> or thinking about hurting yourself, call or text <b>988</b> (Suicide &amp; Crisis Lifeline, US) any time. In an emergency, call <b>911</b>.</p>
      </Sec>

      <Sec title="WellWheel Plus">
        <ul>
          <li><b>Plans:</b> WellWheel Plus is a paid subscription, currently $5.99 a month for one person or $8.99 a month for the couples plan. Prices are shown before you pay and may change; we’ll tell you before a price change affects you.</li>
          <li><b>Couples plan:</b> one payment covers you and the partner you connect with in WellWheel, while you’re connected.</li>
          <li><b>Automatic renewal:</b> Plus renews each month and is charged to your payment method until you cancel.</li>
          <li><b>Canceling:</b> cancel any time in <b>Profile → Manage subscription</b>. You keep Plus until the end of the period you’ve paid for.</li>
          <li><b>Refunds:</b> payments aren’t refundable for partly used periods, except where the law requires otherwise. If you think you were charged by mistake, contact us.</li>
          <li><b>Payments</b> are processed by Stripe, under Stripe’s own terms.</li>
        </ul>
      </Sec>

      <Sec title="Free codes and invite rewards">
        <ul>
          <li>Promotional codes give free Plus for the time stated when you enter them. Each code can be used once per account, may be limited in number, and may end at any time. Codes have no cash value and can’t be sold.</li>
          <li><b>Share with a friend:</b> when a friend creates an account from your invite link and starts a paid Plus plan, you get one free month (a credit toward your next bill, or 30 days of Plus if you’re not paying). Each friend counts once. Friends who join with a free code don’t count.</li>
          <li>We may change or end codes and rewards, and we may remove rewards gained through misuse, such as fake accounts.</li>
        </ul>
      </Sec>

      <Sec title="Your content">
        <p>What you create in WellWheel, such as goals, journal entries, worksheet answers, and photos, belongs to you. You give us permission to store, process, and display it only as needed to run WellWheel for you, including sharing what you choose with a connected partner.</p>
        <p>Only add photos and content you have the right to use. You’re responsible for what you choose to share with a partner.</p>
      </Sec>

      <Sec title="Using WellWheel respectfully">
        <p>Please don’t:</p>
        <ul>
          <li>Break the law, or use WellWheel to harass, threaten, or harm anyone.</li>
          <li>Try to access other people’s accounts or information, or get around how the app works.</li>
          <li>Interfere with or overload WellWheel, or copy, resell, or misuse the app or its content.</li>
        </ul>
        <p>The WellWheel app, its design, worksheets, prompts, and other content are owned by {LEGAL.business} and are for your personal use.</p>
      </Sec>

      <Sec title="Ending your account">
        <p>You can delete your account at any time in Profile. We may suspend or close an account that breaks these terms or puts others at risk. If we close an account without cause, we’ll refund any unused prepaid time.</p>
      </Sec>

      <Sec title="Disclaimers and limits">
        <p>We work hard to keep WellWheel running well, but it’s provided “as is” and “as available.” We can’t promise it will always be available, error-free, or that information won’t be lost, so keep your own copies of anything important.</p>
        <p>To the fullest extent the law allows, {LEGAL.business} isn’t responsible for indirect, incidental, or consequential damages, or for decisions you make based on the app. Our total responsibility for any claim is limited to the amount you paid us in the 12 months before the claim, or $50 if you haven’t paid us. Some places don’t allow these limits, so they may not all apply to you.</p>
      </Sec>

      <Sec title="Governing law">
        <p>These terms are governed by the laws of the State of {LEGAL.state}, without regard to conflict-of-law rules. Any dispute will be handled in the state or federal courts located in {LEGAL.state}, unless the law where you live requires otherwise. Before filing a claim, please contact us first so we can try to resolve it.</p>
      </Sec>

      <Sec title="Changes to these terms">
        <p>We may update these terms. If we make important changes, we’ll update the date at the top and let you know in the app or by email. Using WellWheel after a change means you accept the updated terms.</p>
      </Sec>

      <Sec title="Contact">
        <p>{LEGAL.business}, {LEGAL.state}. Email <a href={`mailto:${LEGAL.contact}`}>{LEGAL.contact}</a>.</p>
      </Sec>
    </LegalPage>
  );
}
