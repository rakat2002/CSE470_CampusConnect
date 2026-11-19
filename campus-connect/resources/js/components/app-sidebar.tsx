
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Droplet,
    FileText,
    FolderGit2,
    HeartPulse,
    Images,
    MessageCircleQuestion,
    Newspaper,
    Package,
    ShoppingBag,
    Users,
    ClipboardList,
    Star,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Find Donors',
        href: '/blood/donors',
        icon: Droplet,
    },
    {
        title: 'My Donor Profile',
        href: '/blood/my-donor',
        icon: HeartPulse,
    },
    {
        title: 'Marketplace',
        href: '/marketplace',
        icon: ShoppingBag,
    },
    {
        title: 'My Listings',
        href: '/marketplace/mine',
        icon: Package,
    },
    {
        title: 'Collaboration Hub',
        href: '/collaboration',
        icon: Users,
    },
    {
        title: 'Personal Study Planner',
        href: '/study-planner',
        icon: ClipboardList,
    },
    {
        title: 'Feedback & Rating',
        href: '/feedback',
        icon: Star,
    },
    {
        title: 'Study Resources',
        href: '/resources',
        icon: FileText,
    },
    {
        title: 'Q&A Help',
        href: '/questions',
        icon: MessageCircleQuestion,
    },
    {
        title: 'Weekly Newsletter',
        href: '/newsletter',
        icon: Newspaper,
    },
    {
        title: 'Memory Gallery',
        href: '/gallery',
        icon: Images,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
