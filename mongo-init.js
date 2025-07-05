// MongoDB initialization script
db = db.getSiblingDB('expense-tracker');

// Create a user for the application
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'expense-tracker'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.expenses.createIndex({ userId: 1, date: -1 });
db.incomes.createIndex({ userId: 1, date: -1 });
db.budgets.createIndex({ userId: 1, category: 1 });
db.goals.createIndex({ userId: 1, isActive: 1 });
db.categories.createIndex({ userId: 1, type: 1 });
db.notifications.createIndex({ userId: 1, isRead: 1 });
db.notifications.createIndex({ scheduledFor: 1 });

print('Database initialized successfully!');