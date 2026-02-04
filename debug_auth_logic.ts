
import { prisma } from "./src/lib/prisma";
import { comparePassword } from "./src/lib/auth/hash";

async function main() {
  const email = "[EMAIL_ADDRESS]"; 
  console.log("Checking user:", email);

  const user = await prisma.usuario.findUnique({
    where: { email },
    include: { candidato: true, empresa: true }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  console.log("User found:", user.id);
  console.log("Tipo:", user.tipo);
  console.log("Candidato:", user.candidato);
  console.log("Empresa:", user.empresa);

  const isCandidateComplete = user.candidato && user.candidato.nome;
  const isCompanyComplete = user.empresa && user.empresa.nome_empresa && user.empresa.nome_empresa !== "";
  const isRegistrationComplete = isCandidateComplete || isCompanyComplete;

  console.log("isCandidateComplete:", isCandidateComplete);
  console.log("isCompanyComplete:", isCompanyComplete);
  console.log("isRegistrationComplete:", isRegistrationComplete);

  const redirectTo = !isRegistrationComplete 
    ? (user.tipo.toLowerCase() === 'candidato' ? "/candidate/register" : "/company/register")
    : (user.tipo.toLowerCase() === 'candidato' ? "/candidate/dashboard" : "/company/dashboard");

  console.log("Calculated RedirectTo:", redirectTo);
}

main();
