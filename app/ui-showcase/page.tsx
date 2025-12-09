'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import Tabs from '@/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@/components/ui/Table';
import Navbar, { NavLink } from '@/components/layout/Navbar';
import Sidebar, { SidebarItem } from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/layout/Container';
import { 
  Home, 
  Settings, 
  Users, 
  Mail, 
  Lock, 
  Search,
  ChevronRight,
  Star,
  Heart,
  Download,
  Upload,
  Check
} from 'lucide-react';

export default function UIShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showAlert, setShowAlert] = useState(true);
  const [isRTL, setIsRTL] = useState(false);

  return (
    <div className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar
        logo={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">YS</span>
            </div>
            <span className="font-semibold text-lg">Youspeak UI</span>
          </div>
        }
      >
        <NavLink href="#components" active>Components</NavLink>
        <NavLink href="#layout">Layout</NavLink>
        <NavLink href="#theme">Theme</NavLink>
        <Button size="sm" variant="primary">Get Started</Button>
      </Navbar>

      <Container size="2xl" className="py-12 space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100">
            Youspeak UI Components
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Professional, accessible, and mobile-first UI components built with React, TypeScript, and Tailwind CSS 4
          </p>
          <div className="flex gap-4 justify-center items-center flex-wrap">
            <Button onClick={() => setIsRTL(!isRTL)}>
              Toggle {isRTL ? 'LTR' : 'RTL'} Mode
            </Button>
            <Badge variant="success" icon={<Check className="h-3 w-3" />}>
              100% Mobile Compatible
            </Badge>
            <Badge variant="info">TypeScript</Badge>
            <Badge variant="accent">Accessible</Badge>
          </div>
        </div>

        <section id="buttons" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Buttons</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Multiple variants and sizes with loading states</p>
          </div>
          
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">With Icons & Loading</h3>
                <div className="flex flex-wrap gap-3">
                  <Button leftIcon={<Download className="h-4 w-4" />}>Download</Button>
                  <Button rightIcon={<ChevronRight className="h-4 w-4" />}>Continue</Button>
                  <Button loading>Loading...</Button>
                  <Button variant="outline" disabled>Disabled</Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Full Width (Mobile)</h3>
                <Button fullWidth variant="primary">Full Width Button</Button>
              </div>
            </div>
          </Card>
        </section>

        <section id="inputs" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Inputs</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Form inputs with validation, icons, and error states</p>
          </div>

          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                hint="We'll never share your email"
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <Input
                label="Search"
                placeholder="Search..."
                leftIcon={<Search className="h-4 w-4" />}
                inputSize="lg"
              />

              <Input
                label="With Error"
                variant="error"
                error="This field is required"
                defaultValue="invalid@"
              />

              <Input
                label="With Success"
                variant="success"
                success="Email is available!"
                defaultValue="available@example.com"
              />

              <Input
                label="Small Size"
                inputSize="sm"
                placeholder="Small input"
              />
            </div>
          </Card>
        </section>

        <section id="cards" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Cards</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Flexible content containers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <h3 className="font-semibold text-lg mb-2">Default Card</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Simple card with default styling and medium padding.
              </p>
            </Card>

            <Card variant="elevated">
              <h3 className="font-semibold text-lg mb-2">Elevated Card</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Card with enhanced shadow on hover for emphasis.
              </p>
            </Card>

            <Card variant="outlined">
              <h3 className="font-semibold text-lg mb-2">Outlined Card</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Card with prominent border and no shadow.
              </p>
            </Card>
          </div>

          <Card
            header={
              <div>
                <h3 className="font-semibold text-lg">Card with Header & Footer</h3>
                <p className="text-sm text-neutral-500 mt-1">Optional header and footer sections</p>
              </div>
            }
            footer={
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button size="sm">Save Changes</Button>
              </div>
            }
          >
            <p className="text-neutral-600 dark:text-neutral-400">
              This card demonstrates the header and footer props. Great for forms, dialogs, and structured content.
            </p>
          </Card>
        </section>

        <section id="badges" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Badges</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Status indicators and labels</p>
          </div>

          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="accent">Accent</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="neutral">Neutral</Badge>
                  <Badge variant="solid">Solid</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">With Icons</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" icon={<Check className="h-3 w-3" />}>Completed</Badge>
                  <Badge variant="error" icon={<Star className="h-3 w-3" />}>Featured</Badge>
                  <Badge variant="info" icon={<Heart className="h-3 w-3" />}>Favorite</Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section id="alerts" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Alerts</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Contextual feedback messages</p>
          </div>

          <div className="space-y-4">
            <Alert variant="info" title="Information">
              This is an informational alert with a title and description.
            </Alert>

            <Alert variant="success" title="Success!">
              Your changes have been saved successfully.
            </Alert>

            <Alert variant="warning" title="Warning">
              Please review your input before proceeding.
            </Alert>

            {showAlert && (
              <Alert 
                variant="error" 
                title="Error" 
                dismissible 
                onDismiss={() => setShowAlert(false)}
              >
                An error occurred. Please try again later.
              </Alert>
            )}
          </div>
        </section>

        <section id="loading" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Loading Spinners</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Loading states and indicators</p>
          </div>

          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <LoadingSpinner size="xs" />
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" />
                  <LoadingSpinner size="lg" />
                  <LoadingSpinner size="xl" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Variants</h3>
                <div className="flex flex-wrap gap-6">
                  <LoadingSpinner variant="primary" label="Loading..." />
                  <LoadingSpinner variant="accent" label="Processing..." />
                  <LoadingSpinner variant="neutral" label="Please wait..." />
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section id="tabs" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Tabs</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Organize content into switchable views</p>
          </div>

          <Card>
            <Tabs defaultValue="overview">
              <Tabs.List>
                <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
                <Tabs.Trigger value="features">Features</Tabs.Trigger>
                <Tabs.Trigger value="pricing">Pricing</Tabs.Trigger>
                <Tabs.Trigger value="support">Support</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="overview">
                <h3 className="font-semibold text-lg mb-2">Overview</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Welcome to the overview section. This is where you'll find general information about our services.
                </p>
              </Tabs.Content>
              <Tabs.Content value="features">
                <h3 className="font-semibold text-lg mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li>Fully responsive design</li>
                  <li>TypeScript support</li>
                  <li>Accessibility built-in</li>
                  <li>RTL language support</li>
                </ul>
              </Tabs.Content>
              <Tabs.Content value="pricing">
                <h3 className="font-semibold text-lg mb-2">Pricing</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Our pricing is competitive and transparent. Contact us for more information.
                </p>
              </Tabs.Content>
              <Tabs.Content value="support">
                <h3 className="font-semibold text-lg mb-2">Support</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  24/7 customer support available. Reach out anytime you need help.
                </p>
              </Tabs.Content>
            </Tabs>
          </Card>
        </section>

        <section id="tables" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Tables</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Responsive data tables</p>
          </div>

          <Table>
            <TableCaption>A list of recent students</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right rtl:text-left">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Ahmed Ali</TableCell>
                <TableCell>ahmed@example.com</TableCell>
                <TableCell>
                  <Badge variant="success" size="sm">Active</Badge>
                </TableCell>
                <TableCell className="text-right rtl:text-left">75%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Sara Mohammed</TableCell>
                <TableCell>sara@example.com</TableCell>
                <TableCell>
                  <Badge variant="success" size="sm">Active</Badge>
                </TableCell>
                <TableCell className="text-right rtl:text-left">92%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Omar Hassan</TableCell>
                <TableCell>omar@example.com</TableCell>
                <TableCell>
                  <Badge variant="warning" size="sm">Pending</Badge>
                </TableCell>
                <TableCell className="text-right rtl:text-left">45%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Fatima Zaid</TableCell>
                <TableCell>fatima@example.com</TableCell>
                <TableCell>
                  <Badge variant="success" size="sm">Active</Badge>
                </TableCell>
                <TableCell className="text-right rtl:text-left">88%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        <section id="modal" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Modal</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Accessible dialog windows</p>
          </div>

          <Card>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            </div>
          </Card>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Welcome to Youspeak"
            description="Join thousands of students learning English"
            size="md"
            footer={
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Get Started
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <p className="text-neutral-600 dark:text-neutral-400">
                Start your English learning journey today with interactive classes, 
                professional instructors, and a supportive community.
              </p>
              <Input
                label="Enter your email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </div>
          </Modal>
        </section>

        <section id="layout" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Layout Components</h2>
            <p className="text-neutral-600 dark:text-neutral-400">Structural components for page layout</p>
          </div>

          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Sidebar Example</h3>
                <div className="h-64 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden flex">
                  <Sidebar
                    header={<div className="font-semibold">Menu</div>}
                    footer={<div className="text-xs text-neutral-500">v1.0.0</div>}
                  >
                    <SidebarItem icon={<Home className="h-4 w-4" />} active>
                      Home
                    </SidebarItem>
                    <SidebarItem icon={<Users className="h-4 w-4" />}>
                      Students
                    </SidebarItem>
                    <SidebarItem icon={<Settings className="h-4 w-4" />}>
                      Settings
                    </SidebarItem>
                  </Sidebar>
                  <div className="flex-1 p-6 bg-neutral-50 dark:bg-neutral-900/50">
                    <p className="text-neutral-600 dark:text-neutral-400">Main content area</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Container Sizes</h3>
                <div className="space-y-3">
                  <Container size="sm" padding="sm" className="bg-primary-50 dark:bg-primary-900/20 py-2">
                    <p className="text-sm">Small container (max-w-screen-sm)</p>
                  </Container>
                  <Container size="md" padding="sm" className="bg-accent-50 dark:bg-accent-900/20 py-2">
                    <p className="text-sm">Medium container (max-w-screen-md)</p>
                  </Container>
                  <Container size="lg" padding="sm" className="bg-success-50 dark:bg-success-900/20 py-2">
                    <p className="text-sm">Large container (max-w-screen-lg)</p>
                  </Container>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </Container>

      <Footer />
    </div>
  );
}
