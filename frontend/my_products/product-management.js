// frontend/my_products/product-management.js

// Function to create the product (basic data, JSON)
async function createProduct(data, token) {
  const response = await fetch("http://localhost:8000/api/market/products/", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
  });

  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create product");
  }

  return await response.json();
}

// Function to upload a single file using FormData
async function uploadFile(file, productId, token) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("product_id", productId);
  formData.append("title", file.name);
  formData.append("is_main_file", false);  // or true if needed
  formData.append("file_type", file.type || "unknown");

  const response = await fetch("http://localhost:8000/api/storage/upload/", {
      method: "POST",
      headers: {
          "Authorization": `Bearer ${token}`
          // Note: no Content-Type here! browser sets it automatically for FormData
      },
      body: formData
  });

  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload file");
  }

  return await response.json();
}

// Main handler linked to the button click event
document.getElementById("createProductBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
      alert("You must be logged in to create a product.");
      return;
  }

  // Collect product info from inputs
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("categories").value;
  const language = document.getElementById("languages").value;
  const price = parseFloat(document.getElementById("pricing").value.trim());

  // Basic validation
  if (title.length < 3 || description.length < 30 || !category || !language || isNaN(price) || price < 0) {
      alert("Please fill all required fields correctly.");
      return;
  }

  // Prepare product data for creation
  const productData = {
      title,
      description,
      category,
      language,
      price
  };

  try {
      // 1) Create product first
      const createdProduct = await createProduct(productData, token);
      alert("Product created successfully!");

      // 2) Upload files/images if any
      const imageFiles = document.getElementById("imageUpload").files;
      const otherFiles = document.getElementById("fileUpload").files;

      // Combine all files into one array
      const allFiles = [...imageFiles, ...otherFiles];

      for (const file of allFiles) {
          await uploadFile(file, createdProduct.id, token);
      }

      alert("All files uploaded successfully!");

      
  } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
  }
});