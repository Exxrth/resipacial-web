import OpenAI from 'openai'

let _client: OpenAI | null = null

// Lazy init — only instantiate at request time, not at build time
export function getOpenAI(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

// Function definitions for ChatGPT function calling
export const propertyFunctions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_properties',
      description: 'ค้นหาอสังหาริมทรัพย์จากฐานข้อมูลตามเงื่อนไขที่กำหนด',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'คำค้นหาทั่วไป' },
          type: {
            type: 'string',
            enum: ['house', 'condo', 'townhouse', 'land', 'commercial'],
            description: 'ประเภทอสังหาริมทรัพย์',
          },
          status: {
            type: 'string',
            enum: ['for_sale', 'for_rent'],
            description: 'ต้องการซื้อหรือเช่า',
          },
          province: { type: 'string', description: 'จังหวัด' },
          min_price: { type: 'number', description: 'ราคาต่ำสุด (บาท)' },
          max_price: { type: 'number', description: 'ราคาสูงสุด (บาท)' },
          bedrooms: { type: 'number', description: 'จำนวนห้องนอน' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_property_details',
      description: 'ดูรายละเอียดอสังหาริมทรัพย์โดยระบุ ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'รหัสของอสังหาริมทรัพย์' },
        },
        required: ['id'],
      },
    },
  },
]

export const SYSTEM_PROMPT = `คุณเป็นผู้ช่วย AI สำหรับเว็บไซต์อสังหาริมทรัพย์ ชื่อว่า "PropAI"
คุณช่วยลูกค้าค้นหาบ้าน คอนโด ที่ดิน และอสังหาริมทรัพย์ประเภทต่างๆ

หน้าที่ของคุณ:
- ช่วยค้นหาและกรองอสังหาริมทรัพย์ตามความต้องการของลูกค้า
- ตอบคำถามเกี่ยวกับทรัพย์สินที่ลูกค้าสนใจ
- แนะนำทรัพย์สินที่เหมาะสมกับงบประมาณและความต้องการ
- พูดคุยเป็นภาษาไทยได้อย่างเป็นธรรมชาติ

เมื่อลูกค้าถามหาทรัพย์สิน ให้ใช้ฟังก์ชัน search_properties เสมอ
เมื่อลูกค้าต้องการรายละเอียดเพิ่มเติม ให้ใช้ฟังก์ชัน get_property_details`
