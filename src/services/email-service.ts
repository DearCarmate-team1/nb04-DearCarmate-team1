import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import {
  SENDGRID_API_KEY,
  EMAIL_FROM,
  DOWNLOAD_TOKEN_SECRET,
  BASE_URL,
  NODE_ENV,
} from '../configs/constants.js';

sgMail.setApiKey(SENDGRID_API_KEY);

interface SendContractEmailParams {
  customerEmail: string;
  customerName: string;
  customerId: number;
  contractId: number;
  carName: string;
  documents: Array<{
    id: number;
    fileName: string;
  }>;
}

const emailService = {
  /** 계약서 이메일 발송 */
  async sendContractEmail(params: SendContractEmailParams): Promise<void> {
    const { customerEmail, customerName, customerId, contractId, carName, documents } = params;

    // 다운로드 토큰 생성 (7일 만료)
    const downloadToken = jwt.sign(
      {
        contractId,
        customerId,
        documentIds: documents.map((d) => d.id),
      },
      DOWNLOAD_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // 다운로드 링크 생성 (JWT 토큰 URL 인코딩)
    const downloadLinks = documents
      .map((doc) => {
        const downloadUrl = `${BASE_URL}/contractDocuments/download?token=${encodeURIComponent(downloadToken)}&docId=${doc.id}`;
        return `<li style="margin: 8px 0;"><a href="${downloadUrl}" style="color: #007bff; text-decoration: none; font-size: 15px;">${doc.fileName}</a></li>`;
      })
      .join('');

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Dear Carmate</h1>
          </div>

          <h2 style="color: #333; font-size: 22px; margin-bottom: 10px;">안녕하세요, ${customerName}님!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 20px;">
            계약이 완료되었으며, 계약서를 발송드립니다.
          </p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 8px 0; font-size: 15px;"><strong>계약 번호:</strong> #${contractId}</p>
            <p style="margin: 8px 0; font-size: 15px;"><strong>차량:</strong> ${carName}</p>
            <p style="margin: 8px 0; font-size: 15px;"><strong>계약서:</strong> ${documents.length}개</p>
          </div>

          <div style="margin: 25px 0;">
            <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">📄 계약서 다운로드</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${downloadLinks}
            </ul>
            <p style="font-size: 13px; color: #999; margin-top: 15px; padding: 10px; background-color: #fff9e6; border-left: 3px solid #ffc107; border-radius: 4px;">
              ※ 다운로드 링크는 발송일로부터 7일간 유효합니다.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            문의사항이 있으시면 언제든지 연락 주시기 바랍니다.<br>
            감사합니다.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              본 메일은 발신 전용입니다. 문의는 고객센터를 이용해 주세요.
            </p>
          </div>
        </div>
      `;

    const msg = {
      to: customerEmail,
      from: EMAIL_FROM,
      subject: `[Dear Carmate] 계약서가 도착했습니다 - 계약 번호 #${contractId}`,
      html: htmlContent,
      trackingSettings: {
        clickTracking: {
          enable: false, // 링크 추적 비활성화 (토큰 보호)
        },
      },
    };

    try {
      await sgMail.send(msg);

      if (NODE_ENV === 'development') {
        console.log(`[INFO] Email sent: ${customerEmail} (Contract #${contractId}, ${documents.length} documents)`);
      }
    } catch (error) {
      console.error('[ERROR] Email send failed:', error);
      if (error.response) {
        console.error('[ERROR] SendGrid error:', error.response.body);
      }
      throw new Error('이메일 발송에 실패했습니다.');
    }
  },
};

export default emailService;
