# Mocker

**Mocker** is a lightweight mock API generator built on top of [Faker.js](https://fakerjs.dev).  
It allows you to define response schemas dynamically using query parameters.

## 🚀 How to Use

Pass your schema as a query parameter `?s=`. Each field follows the format:

`field:namespace.method(paramKey=value,...)`

- Separate fields with `;`
- Works with any HTTP method
- Extra options:
  - `?c=` → set the HTTP status code
  - `?h=` → define custom headers (must be URL encoded)

👉 Check [Faker.js API](https://fakerjs.dev/api) for available functions.  
⚠️ Note: `helpers` module is not supported.

## 📌 Examples

### Basic fields

`/api?s=id:string.uuid;name:person.fullName`

```json
{
  "id": "c9b1b2de-1234-4e12-b5f6-98f23a8a1bcd",
  "name": "John Doe"
}
```

### Nested fields (dot notation)

`/api?s=user.id:string.uuid;user.name:person.fullName`

```json
{
  "user": {
    "id": "9c5e2cda-5678-4eaa-b7a3-fb9a1e3a2bcd",
    "name": "Jane Smith"
  }
}
```

### Arrays

`/api?s=items[2].id:string.uuid;items[2].title:commerce.productName
`

```json
{
  "items": [
    {
      "id": "1d2c3b4a-aaaa-bbbb-cccc-111122223333",
      "title": "Incredible Granite Chair"
    },
    {
      "id": "4d5e6f7a-dddd-eeee-ffff-444455556666",
      "title": "Practical Wooden Table"
    }
  ]
}
```

### With parameters

`/api?s=message:lorem.sentence(5);user.name:person.fullName(sex=male)`

```json
{
  "message": "Lorem ipsum dolor sit amet.",
  "user": {
    "name": "Michael Johnson"
  }
}
```

### Complex schema

`/api?s=message:lorem.sentence(5);meta.time:date.anytime;meta.request_id:string.uuid;data[2].id:string.uuid;data[2].name:person.fullName(sex=male);data[2].email:internet.email(firstName=Jeane,provider=vercel.com);data[2].address.street:lorem.word(length.min=5,length.max=7,strategy=fail);data[2].address.city:location.city;data[2].address.country:location.country
`

```json
{
  "message": "Aliquam sit amet ex commodo.",
  "meta": {
    "time": "2025-08-27T10:15:30.000Z",
    "request_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab"
  },
  "data": [
    {
      "id": "1111aaaa-bbbb-cccc-dddd-222233334444",
      "name": "Robert Brown",
      "email": "Jeane@example.vercel.com",
      "address": {
        "street": "foobar",
        "city": "New York",
        "country": "United States"
      }
    },
    {
      "id": "5555eeee-ffff-1111-2222-666677778888",
      "name": "William Davis",
      "email": "Jeane@test.vercel.com",
      "address": {
        "street": "bazbar",
        "city": "Los Angeles",
        "country": "United States"
      }
    }
  ]
}
```

### With Status Code & Headers

`/api?s=id:string.uuid;name:person.fullName&c=201&h=Content-Type%3Aapplication%2Fjson%7CX-Custom%3Afoobar
`

```json
HTTP/1.1 201 Created
Content-Type: application/json
X-Custom: foobar

{
  "id": "7777aaaa-2222-bbbb-3333-cccc4444dddd",
  "name": "Emily Wilson"
}
```

## 🛠 Host it Yourself

Need more requests or custom rules? Just clone this repository and host it yourself. 🚀

## 🧩 Schema Builder

You can also use the built-in Schema Builder UI:

- Add fields dynamically
- Preview JSON output
- Add custom headers
- Set custom status codes
- Get instant API URL to copy

---

👨‍💻 Created by @maakmall
☕ Support by buying me a coffee!