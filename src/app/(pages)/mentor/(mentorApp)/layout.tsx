import MentorClientLayout from "./MentorClientLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <MentorClientLayout>
            {children}
        </MentorClientLayout>
    );
}
