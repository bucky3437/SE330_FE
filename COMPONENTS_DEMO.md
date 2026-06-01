# 🎨 UI Components Demo - Sprint 2

Tài liệu này demo tất cả UI components mới được tạo trong Sprint 2.

---

## 🔘 Button Component

### Basic Usage
```tsx
import { Button } from "@/components/ui";

<Button>Click Me</Button>
```

### Variants
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
```

### Sizes
```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### With Icons
```tsx
<Button leftIcon={<Icon name="plus" />}>
  Add Item
</Button>

<Button rightIcon={<Icon name="arrow-right" />}>
  Continue
</Button>

<Button leftIcon={<Icon name="download" />} rightIcon={<Icon name="chevron-down" />}>
  Download
</Button>
```

### States
```tsx
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button ripple={false}>No Ripple</Button>
```

---

## 📝 Input Component

### Basic Usage
```tsx
import { Input } from "@/components/ui";

<Input label="Email" type="email" placeholder="you@example.com" />
```

### With Icons
```tsx
<Input 
  label="Search"
  leftIcon={<Icon name="search" />}
  placeholder="Search books..."
/>

<Input 
  label="Password"
  type="password"
  rightIcon={<Icon name="eye" />}
/>
```

### With Clear Button
```tsx
<Input 
  label="Username"
  showClearButton
  onClear={() => console.log("Cleared")}
/>
```

### Floating Label
```tsx
<Input 
  label="Email"
  floatingLabel={true}  // default
  placeholder="Enter your email"
/>

<Input 
  label="Name"
  floatingLabel={false}  // static label
/>
```

### Error State
```tsx
<Input 
  label="Email"
  error="Invalid email address"
  value={email}
/>
```

### With Helper Text
```tsx
<Input 
  label="Password"
  helperText="Must be at least 8 characters"
/>
```

---

## 📋 Select Component

### Basic Usage
```tsx
import { Select } from "@/components/ui";

<Select label="Category">
  <option value="">Select a category</option>
  <option value="fiction">Fiction</option>
  <option value="non-fiction">Non-Fiction</option>
  <option value="science">Science</option>
</Select>
```

### With Icon
```tsx
<Select 
  label="Sort By"
  leftIcon={<Icon name="sort" />}
>
  <option value="title">Title</option>
  <option value="author">Author</option>
  <option value="date">Date</option>
</Select>
```

### Error State
```tsx
<Select 
  label="Country"
  error="Please select a country"
>
  <option value="">Select...</option>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
</Select>
```

---

## ☑️ Checkbox Component

### Basic Usage
```tsx
import { Checkbox } from "@/components/ui";

<Checkbox label="I agree to terms and conditions" />
```

### Sizes
```tsx
<Checkbox label="Small" size="sm" />
<Checkbox label="Medium" size="md" />
<Checkbox label="Large" size="lg" />
```

### Controlled
```tsx
const [checked, setChecked] = useState(false);

<Checkbox 
  label="Subscribe to newsletter"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

### Error State
```tsx
<Checkbox 
  label="Accept terms"
  error="You must accept the terms"
/>
```

---

## 🔘 Radio Component

### Basic Usage
```tsx
import { Radio } from "@/components/ui";

<Radio label="Option 1" name="choice" value="1" />
<Radio label="Option 2" name="choice" value="2" />
<Radio label="Option 3" name="choice" value="3" />
```

### Sizes
```tsx
<Radio label="Small" size="sm" name="size" />
<Radio label="Medium" size="md" name="size" />
<Radio label="Large" size="lg" name="size" />
```

### Controlled
```tsx
const [selected, setSelected] = useState("1");

<Radio 
  label="Option 1"
  name="choice"
  value="1"
  checked={selected === "1"}
  onChange={(e) => setSelected(e.target.value)}
/>
```

---

## 📄 TextArea Component

### Basic Usage
```tsx
import { TextArea } from "@/components/ui";

<TextArea 
  label="Description"
  placeholder="Enter description..."
  rows={5}
/>
```

### With Character Count
```tsx
<TextArea 
  label="Bio"
  maxLength={500}
  showCharCount
  placeholder="Tell us about yourself..."
/>
```

### Resize Options
```tsx
<TextArea resize="none" />      // No resize
<TextArea resize="vertical" />  // Vertical only (default)
<TextArea resize="horizontal" /> // Horizontal only
<TextArea resize="both" />      // Both directions
```

### Error State
```tsx
<TextArea 
  label="Message"
  error="Message is too short"
/>
```

---

## 🎨 Icon Component

### Basic Usage
```tsx
import { Icon } from "@/components/ui";

<Icon name="book" />
<Icon name="user" size={32} />
<Icon name="search" className="text-blue-500" />
```

### With Animations
```tsx
<Icon name="settings" animate="spin" />
<Icon name="bell" animate="pulse" />
<Icon name="heart" animate="bounce" />
```

### Available Icons

**Books & Reading:**
```tsx
<Icon name="book" />
<Icon name="book-open" />
<Icon name="bookmark" />
```

**Users:**
```tsx
<Icon name="user" />
<Icon name="users" />
<Icon name="user-check" />
```

**Actions:**
```tsx
<Icon name="search" />
<Icon name="filter" />
<Icon name="sort" />
<Icon name="edit" />
<Icon name="trash" />
<Icon name="plus" />
<Icon name="minus" />
```

**Navigation:**
```tsx
<Icon name="chevron-down" />
<Icon name="chevron-up" />
<Icon name="chevron-left" />
<Icon name="chevron-right" />
<Icon name="arrow-right" />
<Icon name="arrow-left" />
<Icon name="menu" />
<Icon name="home" />
```

**Status:**
```tsx
<Icon name="check" />
<Icon name="x" />
<Icon name="alert-circle" />
<Icon name="info" />
<Icon name="bell" />
```

**Time:**
```tsx
<Icon name="calendar" />
<Icon name="clock" />
```

**Files:**
```tsx
<Icon name="file" />
<Icon name="upload" />
<Icon name="download" />
```

**UI:**
```tsx
<Icon name="eye" />
<Icon name="eye-off" />
<Icon name="star" />
<Icon name="heart" />
<Icon name="settings" />
<Icon name="logout" />
```

---

## 🃏 Card Component

### Basic Usage
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content of the card</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>
```

### Variants
```tsx
<Card variant="default">Default Card</Card>
<Card variant="bordered">Bordered Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="gradient">Gradient Card</Card>
```

### Padding Sizes
```tsx
<Card padding="none">No Padding</Card>
<Card padding="sm">Small Padding</Card>
<Card padding="md">Medium Padding (default)</Card>
<Card padding="lg">Large Padding</Card>
```

### With Hover Effect
```tsx
<Card hover>
  <CardContent>
    Hover over me!
  </CardContent>
</Card>
```

### Complete Example
```tsx
<Card variant="elevated" hover>
  <CardHeader>
    <CardTitle as="h2">The Great Gatsby</CardTitle>
    <CardDescription>by F. Scott Fitzgerald</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-gray-600">
      A classic American novel set in the Jazz Age...
    </p>
    <div className="mt-4 flex items-center gap-2">
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
        Available
      </span>
      <span className="text-xs text-gray-500">3 copies</span>
    </div>
  </CardContent>
  <CardFooter>
    <Button size="sm" variant="secondary">
      View Details
    </Button>
    <Button size="sm">
      Borrow
    </Button>
  </CardFooter>
</Card>
```

---

## 🎯 Complete Form Example

```tsx
import { Button, Input, Select, Checkbox, Radio, TextArea, Icon } from "@/components/ui";

function BookForm() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    description: "",
    available: false,
    condition: "new",
  });

  const [errors, setErrors] = useState({});

  return (
    <form className="space-y-6">
      {/* Title */}
      <Input 
        label="Book Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        placeholder="Enter book title"
        required
      />

      {/* Author */}
      <Input 
        label="Author"
        value={formData.author}
        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        leftIcon={<Icon name="user" />}
        showClearButton
        onClear={() => setFormData({ ...formData, author: "" })}
      />

      {/* Category */}
      <Select 
        label="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        leftIcon={<Icon name="book" />}
      >
        <option value="">Select a category</option>
        <option value="fiction">Fiction</option>
        <option value="non-fiction">Non-Fiction</option>
        <option value="science">Science</option>
        <option value="history">History</option>
      </Select>

      {/* ISBN */}
      <Input 
        label="ISBN"
        value={formData.isbn}
        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
        placeholder="978-0-123456-78-9"
        helperText="13-digit ISBN number"
      />

      {/* Description */}
      <TextArea 
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        maxLength={500}
        showCharCount
        rows={5}
        placeholder="Enter book description..."
      />

      {/* Condition */}
      <div>
        <label className="mb-3 block text-sm font-bold text-[#000054]">
          Condition
        </label>
        <div className="space-y-2">
          <Radio 
            label="New"
            name="condition"
            value="new"
            checked={formData.condition === "new"}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          />
          <Radio 
            label="Good"
            name="condition"
            value="good"
            checked={formData.condition === "good"}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          />
          <Radio 
            label="Fair"
            name="condition"
            value="fair"
            checked={formData.condition === "fair"}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          />
        </div>
      </div>

      {/* Available */}
      <Checkbox 
        label="Mark as available for borrowing"
        checked={formData.available}
        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
      />

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" leftIcon={<Icon name="check" />}>
          Save Book
        </Button>
        <Button type="button" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

---

## 🎨 Card Grid Example

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Icon } from "@/components/ui";

function BookGrid({ books }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <Card key={book.id} variant="elevated" hover>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle as="h3">{book.title}</CardTitle>
                <CardDescription>by {book.author}</CardDescription>
              </div>
              <Icon name="bookmark" className="text-gray-400" />
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="line-clamp-3 text-sm text-gray-600">
              {book.description}
            </p>
            
            <div className="mt-4 flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                book.available 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {book.available ? "Available" : "Borrowed"}
              </span>
              <span className="text-xs text-gray-500">
                {book.copies} copies
              </span>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              size="sm" 
              variant="secondary"
              leftIcon={<Icon name="eye" />}
            >
              View
            </Button>
            <Button 
              size="sm"
              disabled={!book.available}
              leftIcon={<Icon name="book" />}
            >
              Borrow
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. Always Provide Labels
```tsx
// ✅ Good
<Input label="Email" />

// ❌ Bad
<Input placeholder="Email" />  // No label for screen readers
```

### 2. Use Appropriate Variants
```tsx
// ✅ Good
<Button variant="danger" onClick={handleDelete}>Delete</Button>

// ❌ Bad
<Button onClick={handleDelete}>Delete</Button>  // Should indicate danger
```

### 3. Show Loading States
```tsx
// ✅ Good
<Button loading={isSubmitting}>
  {isSubmitting ? "Saving..." : "Save"}
</Button>

// ❌ Bad
<Button disabled={isSubmitting}>Save</Button>  // No feedback
```

### 4. Provide Error Messages
```tsx
// ✅ Good
<Input 
  label="Email"
  error={errors.email}
  value={email}
/>

// ❌ Bad
<Input 
  label="Email"
  className={errors.email ? "border-red-500" : ""}
/>  // No error message
```

### 5. Use Icons Meaningfully
```tsx
// ✅ Good
<Button leftIcon={<Icon name="plus" />}>Add Book</Button>

// ❌ Bad
<Button leftIcon={<Icon name="star" />}>Add Book</Button>  // Confusing
```

---

*Created: May 20, 2026*  
*Sprint 2 Deliverable*
