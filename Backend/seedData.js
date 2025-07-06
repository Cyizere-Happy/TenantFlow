const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Property = require('./models/Property');
const Tenant = require('./models/Tenant');
const Payment = require('./models/Payment');
const MaintenanceRecord = require('./models/MaintenanceRecord');
const Complaint = require('./models/Complaint');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected for seeding'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const seedData = async () => {
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Tenant.deleteMany({});
    await Payment.deleteMany({});
    await MaintenanceRecord.deleteMany({});
    await Complaint.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@rentmanager.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+250788123456'
    });

    console.log('Created admin user');

    // Create properties
    const properties = await Property.create([
      {
        name: 'Sunset Apartments',
        type: 'apartment',
        address: '123 Kigali Heights, Kigali, Rwanda',
        units: 12,
        rentPerUnit: 150000,
        image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
        description: 'Modern apartment complex with great amenities',
        amenities: ['Parking', 'Security', 'Garden', 'Water'],
        status: 'active'
      },
      {
        name: 'Green Valley Houses',
        type: 'house',
        address: '456 Nyarugenge District, Kigali, Rwanda',
        units: 8,
        rentPerUnit: 250000,
        image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
        description: 'Spacious family houses with private gardens',
        amenities: ['Garden', 'Parking', 'Security', 'Water', 'Electricity'],
        status: 'active'
      },
      {
        name: 'Downtown Commercial Plaza',
        type: 'commercial',
        address: '789 City Center, Kigali, Rwanda',
        units: 6,
        rentPerUnit: 500000,
        image: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg',
        description: 'Prime commercial spaces in city center',
        amenities: ['Parking', 'Security', '24/7 Access', 'Water', 'Electricity'],
        status: 'active'
      },
      {
        name: 'Lake View Residences',
        type: 'apartment',
        address: '321 Lake Kivu Road, Kigali, Rwanda',
        units: 15,
        rentPerUnit: 180000,
        image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
        description: 'Luxury apartments with lake views',
        amenities: ['Lake View', 'Pool', 'Gym', 'Security', 'Parking'],
        status: 'active'
      },
      {
        name: 'Mountain View Estate',
        type: 'house',
        address: '654 Mountain Road, Kigali, Rwanda',
        units: 10,
        rentPerUnit: 300000,
        image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
        description: 'Premium houses with mountain views',
        amenities: ['Mountain View', 'Garden', 'Security', 'Parking', 'Water'],
        status: 'active'
      }
    ]);

    console.log('Created properties');

    // Create tenants
    const tenants = await Tenant.create([
      {
        name: 'Jean Pierre Uwimana',
        email: 'jean.uwimana@email.com',
        phone: '+250788111111',
        propertyId: properties[0]._id,
        unitNumber: 'A1',
        monthlyRent: 150000,
        leaseStart: new Date('2024-01-01'),
        leaseEnd: new Date('2024-12-31'),
        status: 'active',
        emergencyContact: '+250788999999',
        idNumber: '1234567890123456'
      },
      {
        name: 'Marie Claire Niyonsaba',
        email: 'marie.niyonsaba@email.com',
        phone: '+250788222222',
        propertyId: properties[0]._id,
        unitNumber: 'A2',
        monthlyRent: 150000,
        leaseStart: new Date('2024-02-01'),
        leaseEnd: new Date('2025-01-31'),
        status: 'active',
        emergencyContact: '+250788888888',
        idNumber: '1234567890123457'
      },
      {
        name: 'Emmanuel Ndayisaba',
        email: 'emmanuel.ndayisaba@email.com',
        phone: '+250788333333',
        propertyId: properties[1]._id,
        unitNumber: 'H1',
        monthlyRent: 250000,
        leaseStart: new Date('2023-12-01'),
        leaseEnd: new Date('2024-11-30'),
        status: 'active',
        emergencyContact: '+250788777777',
        idNumber: '1234567890123458'
      },
      {
        name: 'Grace Uwamahoro',
        email: 'grace.uwamahoro@email.com',
        phone: '+250788444444',
        propertyId: properties[1]._id,
        unitNumber: 'H2',
        monthlyRent: 250000,
        leaseStart: new Date('2024-01-15'),
        leaseEnd: new Date('2025-01-14'),
        status: 'active',
        emergencyContact: '+250788666666',
        idNumber: '1234567890123459'
      },
      {
        name: 'Business Solutions Ltd',
        email: 'contact@businesssolutions.rw',
        phone: '+250788555555',
        propertyId: properties[2]._id,
        unitNumber: 'C1',
        monthlyRent: 500000,
        leaseStart: new Date('2023-11-01'),
        leaseEnd: new Date('2024-10-31'),
        status: 'active',
        emergencyContact: '+250788555556',
        idNumber: '1234567890123460'
      },
      {
        name: 'Sarah Mukamana',
        email: 'sarah.mukamana@email.com',
        phone: '+250788666666',
        propertyId: properties[3]._id,
        unitNumber: 'LV1',
        monthlyRent: 180000,
        leaseStart: new Date('2024-03-01'),
        leaseEnd: new Date('2025-02-28'),
        status: 'active',
        emergencyContact: '+250788444445',
        idNumber: '1234567890123461'
      },
      {
        name: 'David Nkurunziza',
        email: 'david.nkurunziza@email.com',
        phone: '+250788777777',
        propertyId: properties[4]._id,
        unitNumber: 'MV1',
        monthlyRent: 300000,
        leaseStart: new Date('2024-01-01'),
        leaseEnd: new Date('2024-12-31'),
        status: 'active',
        emergencyContact: '+250788333334',
        idNumber: '1234567890123462'
      },
      {
        name: 'Alice Uwineza',
        email: 'alice.uwineza@email.com',
        phone: '+250788888888',
        propertyId: properties[0]._id,
        unitNumber: 'A3',
        monthlyRent: 150000,
        leaseStart: new Date('2024-02-15'),
        leaseEnd: new Date('2025-02-14'),
        status: 'active',
        emergencyContact: '+250788222223',
        idNumber: '1234567890123463'
      }
    ]);

    console.log('Created tenants');

    // Create payments
    const payments = await Payment.create([
      // January 2024 payments
      {
        tenantId: tenants[0]._id,
        amount: 150000,
        date: new Date('2024-01-05'),
        method: 'bank_transfer',
        month: 'January',
        year: 2024,
        notes: 'Rent payment for January 2024'
      },
      {
        tenantId: tenants[2]._id,
        amount: 250000,
        date: new Date('2024-01-03'),
        method: 'bank_transfer',
        month: 'January',
        year: 2024,
        notes: 'Rent payment for January 2024'
      },
      {
        tenantId: tenants[4]._id,
        amount: 500000,
        date: new Date('2024-01-02'),
        method: 'bank_transfer',
        month: 'January',
        year: 2024,
        notes: 'Rent payment for January 2024'
      },
      {
        tenantId: tenants[6]._id,
        amount: 300000,
        date: new Date('2024-01-04'),
        method: 'bank_transfer',
        month: 'January',
        year: 2024,
        notes: 'Rent payment for January 2024'
      },

      // February 2024 payments
      {
        tenantId: tenants[0]._id,
        amount: 150000,
        date: new Date('2024-02-05'),
        method: 'bank_transfer',
        month: 'February',
        year: 2024,
        notes: 'Rent payment for February 2024'
      },
      {
        tenantId: tenants[1]._id,
        amount: 150000,
        date: new Date('2024-02-02'),
        method: 'bank_transfer',
        month: 'February',
        year: 2024,
        notes: 'Rent payment for February 2024'
      },
      {
        tenantId: tenants[2]._id,
        amount: 250000,
        date: new Date('2024-02-03'),
        method: 'bank_transfer',
        month: 'February',
        year: 2024,
        notes: 'Rent payment for February 2024'
      },
      {
        tenantId: tenants[3]._id,
        amount: 250000,
        date: new Date('2024-02-15'),
        method: 'bank_transfer',
        month: 'February',
        year: 2024,
        notes: 'Rent payment for February 2024'
      },
      {
        tenantId: tenants[4]._id,
        amount: 500000,
        date: new Date('2024-02-01'),
        method: 'bank_transfer',
        month: 'February',
        year: 2024,
        notes: 'Rent payment for February 2024'
      },
      {
        tenantId: tenants[5]._id,
        amount: 180000,
        date: new Date('2024-02-03'),
        method: 'bank_transfer',
        month: 'February',
        year: 2024,
        notes: 'Rent payment for February 2024'
      },
      {
        tenantId: tenants[6]._id,
        amount: 300000,
        date: new Date('2024-02-04'),
        method: 'bank_transfer',
        month: 'February',
        year: 2024,
        notes: 'Rent payment for February 2024'
      },
      {
        tenantId: tenants[7]._id,
        amount: 150000,
        date: new Date('2024-02-15'),
        method: 'bank_transfer',
        month: 'February',
        year: 2024,
        notes: 'Rent payment for February 2024'
      },

      // March 2024 payments
      {
        tenantId: tenants[0]._id,
        amount: 150000,
        date: new Date('2024-03-05'),
        method: 'bank_transfer',
        month: 'March',
        year: 2024,
        notes: 'Rent payment for March 2024'
      },
      {
        tenantId: tenants[1]._id,
        amount: 150000,
        date: new Date('2024-03-02'),
        method: 'bank_transfer',
        month: 'March',
        year: 2024,
        notes: 'Rent payment for March 2024'
      },
      {
        tenantId: tenants[2]._id,
        amount: 250000,
        date: new Date('2024-03-03'),
        method: 'bank_transfer',
        month: 'March',
        year: 2024,
        notes: 'Rent payment for March 2024'
      },
      {
        tenantId: tenants[3]._id,
        amount: 250000,
        date: new Date('2024-03-15'),
        method: 'bank_transfer',
        month: 'March',
        year: 2024,
        notes: 'Rent payment for March 2024'
      },
      {
        tenantId: tenants[4]._id,
        amount: 500000,
        date: new Date('2024-03-01'),
        method: 'bank_transfer',
        month: 'March',
        year: 2024,
        notes: 'Rent payment for March 2024'
      },
      {
        tenantId: tenants[5]._id,
        amount: 180000,
        date: new Date('2024-03-03'),
        method: 'bank_transfer',
        month: 'March',
        year: 2024,
        notes: 'Rent payment for March 2024'
      },
      {
        tenantId: tenants[6]._id,
        amount: 300000,
        date: new Date('2024-03-04'),
        method: 'bank_transfer',
        month: 'March',
        year: 2024,
        notes: 'Rent payment for March 2024'
      },
      {
        tenantId: tenants[7]._id,
        amount: 150000,
        date: new Date('2024-03-15'),
        method: 'bank_transfer',
        month: 'March',
        year: 2024,
        notes: 'Rent payment for March 2024'
      }
    ]);

    console.log('Created payments');

    // Create maintenance records
    const maintenanceRecords = await MaintenanceRecord.create([
      {
        propertyId: properties[0]._id,
        unitNumber: 'A1',
        title: 'Water Heater Repair',
        description: 'Water heater not working properly - no hot water',
        category: 'plumbing',
        cost: 25000,
        vendor: 'John Plumbing Services',
        contactPerson: 'John Smith',
        contactPhone: '+250788111111',
        status: 'completed',
        priority: 'medium',
        scheduledDate: new Date('2024-01-15'),
        completedDate: new Date('2024-01-16'),
        notes: 'Replaced heating element and thermostat'
      },
      {
        propertyId: properties[1]._id,
        unitNumber: 'H1',
        title: 'Electrical Outlet Fix',
        description: 'Electrical outlet malfunctioning - sparks when plugging in devices',
        category: 'electrical',
        cost: 15000,
        vendor: 'Kigali Electric Co.',
        contactPerson: 'Mike Johnson',
        contactPhone: '+250788222222',
        status: 'completed',
        priority: 'high',
        scheduledDate: new Date('2024-02-10'),
        completedDate: new Date('2024-02-10'),
        notes: 'Fixed wiring issue and replaced outlet'
      },
      {
        propertyId: properties[2]._id,
        unitNumber: 'C1',
        title: 'AC System Maintenance',
        description: 'Air conditioning system maintenance and filter replacement',
        category: 'hvac',
        cost: 75000,
        vendor: 'Cool Air Systems',
        contactPerson: 'David Wilson',
        contactPhone: '+250788333333',
        status: 'completed',
        priority: 'medium',
        scheduledDate: new Date('2024-02-20'),
        completedDate: new Date('2024-02-21'),
        notes: 'Regular maintenance and filter replacement'
      },
      {
        propertyId: properties[3]._id,
        unitNumber: 'LV1',
        title: 'Kitchen Sink Unclogging',
        description: 'Kitchen sink clogged - water not draining properly',
        category: 'plumbing',
        cost: 12000,
        vendor: 'Quick Fix Plumbing',
        contactPerson: 'Sarah Brown',
        contactPhone: '+250788444444',
        status: 'in_progress',
        priority: 'low',
        scheduledDate: new Date('2024-03-05'),
        notes: 'Scheduled for tomorrow morning'
      },
      {
        propertyId: properties[4]._id,
        unitNumber: 'MV1',
        title: 'Roof Leak Repair',
        description: 'Roof leak during heavy rain - water entering through ceiling',
        category: 'structural',
        cost: 45000,
        vendor: 'Roof Masters',
        contactPerson: 'Robert Davis',
        contactPhone: '+250788555555',
        status: 'completed',
        priority: 'high',
        scheduledDate: new Date('2024-02-28'),
        completedDate: new Date('2024-03-01'),
        notes: 'Replaced damaged shingles and sealed gaps'
      },
      {
        propertyId: properties[0]._id,
        unitNumber: 'A2',
        title: 'Door Lock Replacement',
        description: 'Door lock not functioning - key not turning properly',
        category: 'other',
        cost: 8000,
        vendor: 'Security Locks Ltd',
        contactPerson: 'Lisa Anderson',
        contactPhone: '+250788666666',
        status: 'completed',
        priority: 'medium',
        scheduledDate: new Date('2024-03-01'),
        completedDate: new Date('2024-03-01'),
        notes: 'Replaced lock mechanism'
      }
    ]);

    console.log('Created maintenance records');

    // Create complaints
    const complaints = await Complaint.create([
      {
        tenantId: tenants[0]._id,
        title: 'Noise from upstairs neighbor',
        description: 'There is excessive noise coming from the apartment above, especially during late hours. This is affecting my sleep and work schedule.',
        urgency: 'medium',
        status: 'resolved',
        createdAt: new Date('2024-01-10'),
        resolvedAt: new Date('2024-01-12'),
        adminReply: 'We have spoken to the upstairs tenant and they have agreed to be more considerate. We will monitor the situation.'
      },
      {
        tenantId: tenants[2]._id,
        title: 'Water pressure too low',
        description: 'The water pressure in the bathroom and kitchen is very low, making it difficult to shower and wash dishes properly.',
        urgency: 'high',
        status: 'in_progress',
        createdAt: new Date('2024-02-15'),
        adminReply: 'We have identified the issue with the water pump. A technician will be here tomorrow to fix it.'
      },
      {
        tenantId: tenants[4]._id,
        title: 'Parking space issue',
        description: 'Someone is consistently parking in my assigned parking space. This is causing inconvenience as I have to park far from the building.',
        urgency: 'medium',
        status: 'open',
        createdAt: new Date('2024-03-01')
      },
      {
        tenantId: tenants[5]._id,
        title: 'Internet connection problems',
        description: 'The internet connection in my apartment is very slow and keeps disconnecting. This is affecting my work as I work from home.',
        urgency: 'high',
        status: 'resolved',
        createdAt: new Date('2024-02-20'),
        resolvedAt: new Date('2024-02-22'),
        adminReply: 'We have upgraded the internet connection and the issue should be resolved. Please test and let us know if you still experience problems.'
      },
      {
        tenantId: tenants[6]._id,
        title: 'Garbage collection schedule',
        description: 'The garbage collection schedule seems to have changed. Can you please provide the updated schedule?',
        urgency: 'low',
        status: 'resolved',
        createdAt: new Date('2024-02-25'),
        resolvedAt: new Date('2024-02-26'),
        adminReply: 'Garbage collection is now on Monday, Wednesday, and Friday at 7 AM. We have posted the updated schedule in the lobby.'
      },
      {
        tenantId: tenants[1]._id,
        title: 'Security concern',
        description: 'I noticed that the main gate was left open last night. This is a security concern for all residents.',
        urgency: 'high',
        status: 'resolved',
        createdAt: new Date('2024-01-20'),
        resolvedAt: new Date('2024-01-21'),
        adminReply: 'We have addressed this with the security team and implemented additional checks. The gate will be properly secured at all times.'
      }
    ]);

    console.log('Created complaints');

    console.log('✅ Data seeding completed successfully!');
    console.log(`Created ${properties.length} properties`);
    console.log(`Created ${tenants.length} tenants`);
    console.log(`Created ${payments.length} payments`);
    console.log(`Created ${maintenanceRecords.length} maintenance records`);
    console.log(`Created ${complaints.length} complaints`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 