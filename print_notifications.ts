import { prisma } from "./src/lib/prisma";
import { getCompanyNotifications } from "./src/lib/notifications";

async function main() {
    const user = await prisma.usuario.findFirst({
        where: { email: { contains: '@' }, tipo: 'empresa' } // ou find the specific user
    });
    
    // We can just fetch the vacancy by name to find the companyId
    const vacancy = await prisma.vaga.findFirst({ where: { cargo: { contains: 'QA/Tester' } } });
    if (!vacancy) return console.log("vaga not found");
    const notifications = await getCompanyNotifications(vacancy.empresa_id);
    console.log(notifications.map(n => ({ id: n.id, type: n.type, title: n.title, date: n.date })));
}
main();
