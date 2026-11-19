import { Link, usePage } from '@inertiajs/react';
import { Droplet, FileText, HeartPulse, Images, LayoutGrid, MessageCircleQuestion, Newspaper, Package, ShieldCheck, ShoppingBag, Users } from 'lucide-react';
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
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
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

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    // Read the logged-in user; admins get one extra menu item
    const { auth } = usePage().props as unknown as { auth: { user: { role?: string } } };
    const navItems: NavItem[] =
        auth.user?.role === 'admin'
            ? [...mainNavItems, { title: 'Admin Panel', href: '/admin', icon: ShieldCheck }]
            : mainNavItems;

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
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}