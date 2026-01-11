import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@bookinghub.com' },
        update: {},
        create: {
            email: 'admin@bookinghub.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
            emailVerified: new Date(),
        },
    });
    console.log('✓ Admin user created:', admin.email);

    // Create categories
    const categories = [
        {
            name: 'Health & Wellness',
            slug: 'health-wellness',
            description: 'Medical consultations, therapy, fitness training',
        },
        {
            name: 'Beauty & Spa',
            slug: 'beauty-spa',
            description: 'Hair salons, nail care, massage therapy',
        },
        {
            name: 'Professional Services',
            slug: 'professional-services',
            description: 'Legal, accounting, consulting services',
        },
        {
            name: 'Education & Tutoring',
            slug: 'education-tutoring',
            description: 'Private tutoring, music lessons, language classes',
        },
        {
            name: 'Home Services',
            slug: 'home-services',
            description: 'Cleaning, repairs, maintenance',
        },
        {
            name: 'Automotive',
            slug: 'automotive',
            description: 'Car repair, detailing, maintenance',
        },
    ];

    for (const category of categories) {
        const created = await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
        console.log('✓ Category created:', created.name);
    }

    // Create sample vendor user
    const vendorPassword = await bcrypt.hash('vendor123', 10);
    const vendorUser = await prisma.user.upsert({
        where: { email: 'vendor@example.com' },
        update: {},
        create: {
            email: 'vendor@example.com',
            name: 'John Doe',
            password: vendorPassword,
            role: 'VENDOR',
            emailVerified: new Date(),
            phone: '+1234567890',
        },
    });
    console.log('✓ Vendor user created:', vendorUser.email);

    // Create vendor profile
    const healthCategory = await prisma.category.findUnique({
        where: { slug: 'health-wellness' },
    });

    const vendor = await prisma.vendor.upsert({
        where: { userId: vendorUser.id },
        update: {},
        create: {
            userId: vendorUser.id,
            businessName: 'Wellness Center',
            description: 'Professional health and wellness services',
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001',
            phone: '+1234567890',
            status: 'APPROVED',
            approvedAt: new Date(),
        },
    });
    console.log('✓ Vendor profile created:', vendor.businessName);

    // Create sample services
    if (healthCategory) {
        const services = [
            {
                vendorId: vendor.id,
                categoryId: healthCategory.id,
                name: 'General Consultation',
                description: 'Professional health consultation',
                duration: 60,
                price: 100,
                currency: 'USD',
                isActive: true,
            },
            {
                vendorId: vendor.id,
                categoryId: healthCategory.id,
                name: 'Follow-up Session',
                description: 'Follow-up consultation session',
                duration: 30,
                price: 50,
                currency: 'USD',
                isActive: true,
            },
        ];

        for (const service of services) {
            const created = await prisma.service.create({
                data: service,
            });
            console.log('✓ Service created:', created.name);
        }
    }

    // Create vendor availability (Monday to Friday, 9 AM to 5 PM)
    const availability = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
    ];

    for (const slot of availability) {
        await prisma.vendorAvailability.upsert({
            where: {
                vendorId_dayOfWeek_startTime: {
                    vendorId: vendor.id,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                },
            },
            update: {},
            create: {
                vendorId: vendor.id,
                ...slot,
            },
        });
    }
    console.log('✓ Vendor availability created');

    // Create sample customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            name: 'Jane Smith',
            password: customerPassword,
            role: 'CUSTOMER',
            emailVerified: new Date(),
            phone: '+1987654321',
        },
    });
    console.log('✓ Customer user created:', customer.email);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDefault accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@bookinghub.com');
    console.log('  Password: admin123');
    console.log('\nVendor:');
    console.log('  Email: vendor@example.com');
    console.log('  Password: vendor123');
    console.log('\nCustomer:');
    console.log('  Email: customer@example.com');
    console.log('  Password: customer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Please change these passwords in production!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
