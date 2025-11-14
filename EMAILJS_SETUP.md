# Hướng dẫn cấu hình EmailJS

## ⚠️ QUAN TRỌNG: Cấu hình Service và Template

### Bước 1: Cấu hình Service (Gmail API)

Nếu bạn đang sử dụng Gmail API và gặp lỗi "insufficient authentication scopes":

1. Vào EmailJS Dashboard → **Email Services**
2. Chọn service Gmail của bạn
3. Click **"Reconnect"** hoặc **"Re-authorize"** để cấp lại quyền
4. **QUAN TRỌNG**: Khi Google yêu cầu cấp quyền, đảm bảo chọn **"Send email on your behalf"** hoặc các quyền gửi email
5. Nếu vẫn lỗi, thử tạo service mới với quyền đầy đủ

### Bước 2: Cấu hình Template Settings

1. Vào **Email Templates** → Chọn template của bạn
2. Trong phần **Settings** (bên phải hoặc tab Settings):
   - **To Email**: Nhập `{{to_email}}` hoặc `{{email}}` (KHÔNG có dấu ngoặc kép thừa)
   - **From Name**: Tên người gửi (ví dụ: "UPGEN Coworking Space")
   - **Subject**: Tiêu đề email (ví dụ: "Xác nhận đặt chỗ #{{order_id}}")
   - **Reply To**: Có thể để trống hoặc nhập `{{reply_to}}`

### Bước 3: Kiểm tra Service Settings

1. Vào **Email Services** → Chọn service của bạn
2. Trong **Service Settings**, tìm field **"To Email"** hoặc **"Recipient"**
3. **QUAN TRỌNG**: 
   - Nếu có field này, để **TRỐNG** hoặc nhập `{{to_email}}`
   - KHÔNG nhập email cố định ở đây nếu bạn muốn dùng dynamic email

## Bước 3: Cấu hình biến môi trường

Thêm vào file `.env.local`:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_WEBSITE_LINK=https://your-website.com
```

## Bước 4: Kiểm tra Template Variables

Đảm bảo template của bạn sử dụng các biến sau:
- `{{to_email}}` - Email người nhận (BẮT BUỘC)
- `{{order_id}}` - Mã đặt chỗ
- `{{customer_name}}` - Tên khách hàng
- `{{customer_phone}}` - Số điện thoại
- `{{customer_email}}` - Email khách hàng
- `{{checkin}}` - Thời gian check-in
- `{{checkout}}` - Thời gian check-out
- `{{{spaces_html}}}` - HTML danh sách không gian (3 dấu ngoặc nhọn để render HTML)
- `{{{services_html}}}` - HTML danh sách dịch vụ (3 dấu ngoặc nhọn để render HTML)
- `{{total_amount}}` - Tổng tiền
- `{{website_link}}` - Link website

## Lưu ý quan trọng:

1. **To Email field**: Phải được cấu hình trong template settings, không phải trong service settings
2. **HTML variables**: Sử dụng `{{{variable}}}` (3 dấu ngoặc nhọn) cho HTML content
3. **Email validation**: Code đã kiểm tra format email trước khi gửi
4. **Error handling**: Lỗi sẽ được log ra console, không hiển thị cho người dùng

## Troubleshooting:

### Lỗi 422: "The recipients address is empty"

**Nguyên nhân**: EmailJS không nhận được địa chỉ email người nhận

**Cách khắc phục**:
1. ✅ Kiểm tra trong **Template Settings** → "To Email" field:
   - Phải nhập: `{{to_email}}` hoặc `{{email}}`
   - KHÔNG có dấu ngoặc kép thừa: `"{{to_email}}"` ❌
   - KHÔNG có khoảng trắng: `{{ to_email }}` ❌
   - Đúng format: `{{to_email}}` ✅

2. ✅ Kiểm tra trong **Service Settings**:
   - Field "To Email" phải để TRỐNG hoặc nhập `{{to_email}}`
   - KHÔNG nhập email cố định ở đây

3. ✅ Kiểm tra console log:
   - Xem "Sending email to: [email]" để xác nhận email được truyền
   - Xem "with params" để kiểm tra `to_email` có giá trị không

4. ✅ Thử các biến email khác trong Template Settings:
   - `{{to_email}}` (thử đầu tiên)
   - `{{email}}`
   - `{{user_email}}`
   - `{{recipient_email}}`

### Lỗi 412: "Gmail_API: Request had insufficient authentication scopes"

**Nguyên nhân**: Gmail service chưa được cấp đủ quyền

**Cách khắc phục**:
1. Vào **Email Services** → Chọn Gmail service
2. Click **"Reconnect"** hoặc **"Re-authorize"**
3. Khi Google hiện popup, chọn **"Allow"** cho tất cả quyền
4. Đảm bảo chọn quyền **"Send email"** hoặc **"Send email on your behalf"**
5. Nếu vẫn lỗi, thử tạo service mới với quyền đầy đủ

### Kiểm tra khác:

1. ✅ Đảm bảo customer email không bị trống trong database
2. ✅ Kiểm tra format email hợp lệ (có @ và domain)
3. ✅ Reload trang sau khi thay đổi cấu hình EmailJS
4. ✅ Kiểm tra Service ID, Template ID, Public Key đúng chưa

