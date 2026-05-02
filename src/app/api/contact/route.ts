import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { sendContactEmail } from '@/src/lib/mail'

function removeLinks(text: string): string {
    // Matches http(s)://, www., and bare domains like foo.com
    return text
        .replace(/https?:\/\/[^\s]+/gi, '[Link Removido]')
        .replace(/www\.[^\s]+/gi, '[Link Removido]')
        .replace(/[a-zA-Z0-9-]+\.(com|net|org|io|ai|co|br|info|biz|edu|gov|me|app|dev)[^\s]*/gi, '[Link Removido]')
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const { fullName, userType, subject, message, department } = body
        if (department !== 'zen') {
            return NextResponse.json({ success: true })
        }

        if (!fullName || !userType || !subject || !message) {
            return NextResponse.json({ success: false, error: 'missing_fields' }, { status: 400 })
        }

        const cleanName = removeLinks(String(fullName).trim())
        const cleanSubject = removeLinks(String(subject).trim())
        const cleanMessage = removeLinks(String(message).trim())

        await (prisma as any).contact.create({
            data: {
                fullName: cleanName,
                userType: String(userType),
                subject: cleanSubject,
                message: cleanMessage,
            },
        })

        await sendContactEmail(cleanName, String(userType), cleanSubject, cleanMessage)

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[Contact API]', err)
        return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 })
    }
}
