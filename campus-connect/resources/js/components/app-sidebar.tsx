import { Link, usePage } from '@inertiajs/react';
import { Droplet, FolderGit2, HeartPulse, LayoutGrid, Package, ShieldCheck, ShoppingBag } from 'lucide-react';
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