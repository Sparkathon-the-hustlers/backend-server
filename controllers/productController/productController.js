const Product = require("../../models/productModel/productModel");
const elasticClient = require("../../config/elasticSearchConfig/elasticSearchClient");
const Category = require("../../models/categoryModel/categoryModel");
const { Op, fn, col, literal } = require("sequelize");
const {
  extractLabelsFromImageS3,
} = require("../../awsRekognition/awsRekognition");
const Review = require("../../models/reviewModel/reviewModel");
const User = require("../../models/authModel/userModel");
const ReviewLike = require("../../models/reviewLikeModel/reviewLikeModel");
const axios = require("axios");
const materialMap = {
"ABS Plastic":0,
"Acrylic":1,
"Algae-Based Foam":2,
"Aluminum (Virgin)":3,
"Apple Leather":4,
"Bagasse":5,
"Bamboo":6,
"Bamboo Charcoal Fiber":7,
"Banana Fiber":8,
"Beeswax":9,
"Biodegradable TPU":10,
"Camel Dung Paper":11,
"Camel Wool":12,
"Chitosan (Shrimp Shells)":13,
"Chlorinated Plastic":14,
"Coconut Oil":15,
"Conventional Cotton":16,
"Corn Husks":17,
"Cornstarch Bioplastic (PLA/PBAT)":18,
"Epoxy Resin":19,
"Faux Leather (PVC-based)":20,
"Flax Linen":21,
"FSC-Certified Paper":22,
"Hemp":23,
"Jojoba Oil":24,
"Jute":25,
"Kapok Fiber":26,
"Lead-Based Paint":27,
"Luffa":28,
"Lyocell (TENCEL)":29,
"Melamine":30,
"Microplastics":31,
"Milk Protein Fiber":32,
"Mycelium (Mushroom Leather)":33,
"Natural Rubber":34,
"Non-Biodegradable Foam":35,
"Non-Recycled Aluminum":36,
"Non-recycled Paper":37,
"Nylon (Virgin)":38,
"Organic Cotton":39,
"Palm Leaves":40,
"PET (Virgin)":41,
"Pinatex (Pineapple Leather)":42,
"Plastic (General)":43,
"Plastic-Coated Paper":44,
"Polycarbonate":45,
"Polystyrene (Styrofoam)":46,
"Polyurethane Foam":47,
"PVC (Polyvinyl Chloride)":48,
"PVC Flooring":49,
"Raffia":50,
"Ramie":51,
"Recycled Cotton":52,
"Recycled Glass":53,
"Recycled Kraft Paper":54,
"Recycled Nylon (ECONYL)":55,
"Recycled Paper":56,
"Recycled Polyester":57,
"Scrap Metal (Brass, Copper)":58,
"Seaweed-based Plastic":59,
"Sisal or Coconut Fiber":60,
"Soy Wax":61,
"Stone Paper":62,
"Synthetic Latex":63,
"Synthetic Polyester":64,
"Teflon (PTFE)":65,
"Terracotta":66,
"Tree Resin":67,
"Upcycled Cotton/Denim":68,
"Virgin Rubber":69,
"Virgin Steel":70,
"Wool (Ethically Sourced)":71,

};


const typeMap = {
  "Sustainable": 0,
  "Unsustainable": 1,
};

const usedInMap = {
"Toys, Electronics":0,
"Knitwear, Plastic Goods":1,
"Shoes, Yoga Mats":2,
"Cans, Foils":3,
"Wallets, Bags":4,
"Plates, Containers":5,
"Brushes, Cutlery, Toys, Hairbrushes":6,
"Textiles":7,
"Textiles, Paper":8,
"Wraps":9,
"Packaging, Accessories":10,
"Stationery":11,
"Textiles":12,
"Bioplastics":13,
"Packaging":14,
"Soap, Deodorant":15,
"Mass Clothing":16,
"Packaging, Crafts":17,
"Bags, Plates":18,
"Coatings, Crafting":19,
"Bags, Shoes":20,
"Dresses, Apparel":21,
"Books, Cards":22,
"Bags, Clothing":23,
"Wraps, Cosmetics":24,
"Bags, Rugs":25,
"Stuffing, Insulation":26,
"Old Products":27,
"Sponges":28,
"Clothing, Bedding":29,
"Dishes":30,
"Cosmetics, Clothing":31,
"Fabrics":32,
"Fashion, Packaging":33,
"Shoes, Toys":34,
"Packaging":35,
"Cans, Foil":36,
"Office Supplies":37,
"Textiles":38,
"Clothing, Bags, Filters":39,
"Plates, Bowls":40,
"Water Bottles":41,
"Bags, Shoes":42,
"Conventional Packaging":43,
"Cups, Boxes":44,
"Eyewear, Bottles":45,
"Cups, Packaging":46,
"Mattresses":47,
"Plumbing, Cheap Toys":48,
"Construction":49,
"Hats, Mats":50,
"Fabrics":51,
"Apparel, Bags":52,
"Candles, Jars":53,
"Packaging, Wrapping":54,
"Swimwear, Activewear":55,
"Towels, Cards":56,
"Jackets, Clothing":57,
"Jewelry":58,
"Packaging":59,
"Brush Bristles":60,
"Candles, Crayons":61,
"Notebooks":62,
"Gloves, Balloons":63,
"Fast Fashion":64,
"Cookware":65,
"Pots, Planters":66,
"Wraps":67,
"Clothing, Toys":68,
"Shoes, Tires":69,
"Construction":70,
"Clothing, Blankets":71,

};


// const updateFakeGreenScores = async (req, res) => {
//   try {
//     const product = await Product.findOne({
//       where: {
//         id: 1,
//         productMaterial: { [Op.ne]: null },
//         productMaterialType: { [Op.ne]: null },
//         productMaterialUsed: { [Op.ne]: null },
//       },
//     });

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product with ID 1 not found or missing required fields.",
//       });
//     }

//     const material = product.productMaterial?.trim();
//     const type = product.productMaterialType?.trim();
//     const used = product.productMaterialUsed?.trim();

//     console.log(" Raw Material Inputs:");
//     console.log("Material:", material);
//     console.log("Type:", type);
//     console.log("Used In:", used);

//     const materialEncoded = materialMap[material];
//     const typeEncoded = typeMap[type];
//     const usedEncoded = usedInMap[used];

//     console.log(" Encoded Inputs:");
//     console.log("materialEncoded:", materialEncoded);
//     console.log("typeEncoded:", typeEncoded);
//     console.log("usedEncoded:", usedEncoded);

//     if (
//       materialEncoded === undefined ||
//       typeEncoded === undefined ||
//       usedEncoded === undefined
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: ` Encoding not found for one of the fields.`,
//         debug: {
//           material,
//           materialEncoded,
//           type,
//           typeEncoded,
//           used,
//           usedEncoded,
//         },
//       });
//     }

//     // Call AI model
//     console.log("📡 Sending to AI model with:");
//     const payload = {
//       feature1: materialEncoded,
//       feature2: usedEncoded,
//       feature3: typeEncoded,
//     };
//     console.log(payload);

//     const aiResponse = await axios.post("http://127.0.0.1:8000/predict", payload);

//     const greenScore = aiResponse.data.prediction ?? 0;

//     console.log(" AI Model Response:", aiResponse.data);

//     // Update DB
//     await product.update({
//       greenScore,
//       productDiscountPrice: null,
//     });

//     console.log(` Product ID ${product.id} updated with Green Score: ${greenScore}`);

//     return res.status(200).json({
//       success: true,
//       message: `Green score updated for product ID 1`,
//       updatedProduct: {
//         id: product.id,
//         greenScore,
//         modelInputs: payload,
//         aiResponse: aiResponse.data,
//       },
//     });

//   } catch (err) {
//     console.error("🔥 Error updating product ID 1:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while updating green score for product ID 1.",
//       error: err.message,
//     });
//   }
// };


const updateFakeGreenScores = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        productMaterial: { [Op.ne]: null },
        productMaterialType: { [Op.ne]: null },
        productMaterialUsed: { [Op.ne]: null },
      },
    });

    const updatedProducts = [];

    for (const product of products) {
      try {
        const material = product.productMaterial?.trim();
        const type = product.productMaterialType?.trim();
        const used = product.productMaterialUsed?.trim();

        const materialEncoded = materialMap[material];
        const typeEncoded = typeMap[type];
        const usedEncoded = usedInMap[used];

        if (
          materialEncoded === undefined ||
          typeEncoded === undefined ||
          usedEncoded === undefined
        ) {
          console.warn(
            ` Skipped Product ID ${product.id}: Unknown encoding for "${material}", "${type}", "${used}"`
          );
          continue;
        }

        // Step 2: Send to FastAPI model
        const aiResponse = await axios.post("http://127.0.0.1:8000/predict", {
          feature1: materialEncoded,
          feature2:usedEncoded,
          feature3: typeEncoded,
        });

        const greenScore = aiResponse.data.prediction || 0;

        //  Step 3: Update Product with real green score
        await product.update({
          greenScore,
          productDiscountPrice: null, // optional
        });

        updatedProducts.push({
          id: product.id,
          greenScore,
        });
      } catch (err) {
        console.error(` Failed Product ID ${product.id}: ${err.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Green scores updated using hardcoded label encoding.",
      updatedCount: updatedProducts.length,
      updatedProducts,
    });
  } catch (err) {
    console.error("Server Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update green scores.",
      error: err.message,
    });
  }
};

const handleAddProduct = async (req, res) => {
  try {
   
    const {
      productName,
      productDescription,
      productBrand,
      productCategoryId,
      stockKeepingUnit,
      productModelNumber,
      productBestSaleTag,
      productPrice,
      productDiscountPrice,
      saleDayleft,

      availableStockQuantity,
      productWeight,

      galleryImageUrls,
      productVideoUrl,
      productSizes,
      productColors,
      productDimensions,
      productMaterial,
      productMaterialType,
      productMaterialUsed,

      productWarrantyInfo,
      productReturnPolicy,
    } = req.body;
    if (!req.file || !req.file.location) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed or missing.",
      });
    }
    if (
      !productName ||
      !productDescription ||
      !productBrand ||
      !productCategoryId ||
      !productPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const imageKey = decodeURIComponent(
      new URL(req.file.location).pathname.slice(1)
    );
    const rekognitionLabels = await extractLabelsFromImageS3(
      process.env.AWS_BUCKET_NAME,
      imageKey
    );

    const productTags = rekognitionLabels.join(", ");

    const category = await Category.findByPk(productCategoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.increment("categoryProductCount");




 let greenScore = 0;
    const material = productMaterial?.trim();
    const type = productMaterialType?.trim();
    const used = productMaterialUsed?.trim();

    const materialEncoded = materialMap[material];
    const typeEncoded = typeMap[type];
    const usedEncoded = usedInMap[used];

    if (
      materialEncoded !== undefined &&
      typeEncoded !== undefined &&
      usedEncoded !== undefined
    ) {
      try {
        const aiResponse = await axios.post("http://127.0.0.1:8000/predict", {
          feature1: materialEncoded,
          feature2: usedEncoded,
          feature3: typeEncoded,
        });
        greenScore = aiResponse.data.prediction || 0;
      } catch (err) {
        console.warn("AI model error:", err.message);
      }
    }



    const product = await Product.create({
      productName,
      productDescription,
      productBrand,
      productCategoryId,
      stockKeepingUnit: stockKeepingUnit || null,
      productModelNumber: productModelNumber || null,
      productBestSaleTag: productBestSaleTag || null,

      productMaterial: productMaterial || null,
      productDimensions: productDimensions || null,
      productColors: productColors || null,
      productSizes: productSizes || null,

      greenScore: greenScore || null,
      productMaterialType: productMaterialType || null,
      productMaterialUsed:productMaterialUsed || null,
      productPrice,
      productDiscountPrice: productDiscountPrice || null,
      saleDayleft: saleDayleft || null,

      availableStockQuantity: availableStockQuantity || 0,
      productWeight: productWeight || null,
      status: req.user.role === "admin" ? "approved" : "pending",

      coverImageUrl: req.file.location,
      galleryImageUrls: galleryImageUrls || null,
      productVideoUrl: productVideoUrl || null,

      productWarrantyInfo: productWarrantyInfo || null,
      productReturnPolicy: productReturnPolicy || null,
  
      productTags,
      rekognitionLabels,
    });

    await elasticClient.index({
      index: "products",
      id: product.id.toString(),
      body: {
        ...product.toJSON(),
        suggest: {
          input: [
            product.productName,
            product.productBrand,
            ...(product.productTags ? product.productTags.split(",") : []),
          ],
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding product.",
      error: error.message,
    });
  }
};
const handleUpdateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const updateFields = {};

    const fields = [
      "productName",
      "productDescription",
      "productBrand",
      "productCategoryId",
      "stockKeepingUnit",
      "productModelNumber",
      "productBestSaleTag",
      "productDiscountPercentage",
      "productPrice",
      "productDiscountPrice",
      "saleDayleft",
      "availableStockQuantity",
      "productWeight",
      "productSizes",
      "productColors",
      "productDimensions",
      "productMaterial",
      "productMaterialType",
      "productMaterialUsed",
      "productWarrantyInfo",
      "productReturnPolicy",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    if (req.file && req.file.location) {
      updateFields.coverImageUrl = req.file.location;

      const imageKey = decodeURIComponent(
        new URL(req.file.location).pathname.slice(1)
      );
      const rekognitionLabels = await extractLabelsFromImageS3(
        process.env.AWS_BUCKET_NAME,
        imageKey
      );

      updateFields.rekognitionLabels = rekognitionLabels;
      updateFields.productTags = rekognitionLabels.join(", ");
    }

    const galleryImages = req.files?.galleryImageUrls || [];
    if (galleryImages.length > 0) {
      updateFields.galleryImageUrls = galleryImages.map((img) => img.location);
    }

    const productVideo = req.files?.productVideoUrl?.[0];
    if (productVideo?.location) {
      updateFields.productVideoUrl = productVideo.location;
    }

    await product.update(updateFields);

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating product.",
      error: error.message,
    });
  }
};

const handleDeleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await product.destroy();

    await elasticClient.delete({
      index: "products",
      id: product.id.toString(),
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product.",
      error: error.message,
    });
  }
};

//   try {
//     const products = await Product.findAll({ where: { status: 'approved' } });
//     res.status(200).json({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     console.error("Get All Products Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching all products",
//       error: error.message,
//     });
//   }
// };

// const getProductById = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const product = await Product.findByPk(productId);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       product,
//     });
//   } catch (error) {
//     console.error("Get Product by ID Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching product by ID",
//       error: error.message,
//     });
//   }
// };

// const searchProducts = async (req, res) => {
//   const { query } = req.query;

//   if (!query) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing search query",
//     });
//   }

//   try {
//     const { hits } = await elasticClient.search({
//       index: 'products',
//       query: {
//         multi_match: {
//           query,
//           fields: ['productName', 'productBrand', 'productCategory'],
//           fuzziness: 'AUTO' // improves flexible matching
//         }
//       }
//     });

//     const results = hits.hits.map(hit => hit._source);

//     res.status(200).json({
//       success: true,
//       products: results,
//     });
//   } catch (error) {
//     console.error("Elasticsearch Search Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while searching products",
//       error: error.message,
//     });
//   }
// };

const getAllProducts = async (req, res) => {
  try {
    const {
      categories,
      brands,
      minPrice,
      maxPrice,
      inventoryStatus,
      colors,
      sortBy,
    } = req.query;

    const categoryFilter = categories
      ? categories.split(",").map((c) => c.trim())
      : null;
    const brandFilter = brands ? brands.split(",").map((b) => b.trim()) : null;
    const inventoryFilter = inventoryStatus
      ? inventoryStatus.split(",").map((s) => s.trim())
      : null;
    const colorFilter = colors ? colors.split(",").map((c) => c.trim()) : null;

    let orderClause = [["createdAt", "DESC"]];
    switch (sortBy) {
      case "popular":
        orderClause = [["totalSoldCount", "DESC"]];
        break;
      case "rating":
        orderClause = [["averageCustomerRating", "DESC"]];
        break;
      case "priceLowToHigh":
        orderClause = [["productPrice", "ASC"]];
        break;
      case "priceHighToLow":
        orderClause = [["productPrice", "DESC"]];
        break;
      case "latest":
        orderClause = [["createdAt", "DESC"]];
        break;
    }

    const whereClause = {
      status: "approved",
      ...(brandFilter && {
        productBrand: { [Op.in]: brandFilter },
      }),
      ...((minPrice || maxPrice) && {
        productPrice: {
          ...(minPrice && { [Op.gte]: parseFloat(minPrice) }),
          ...(maxPrice && { [Op.lte]: parseFloat(maxPrice) }),
        },
      }),

      ...(inventoryFilter && {
        inventoryStatus: { [Op.in]: inventoryFilter },
      }),
      ...(colorFilter && {
        productColors: {
          [Op.or]: colorFilter.map((color) => ({
            [Op.like]: `%${color}%`,
          })),
        },
      }),
    };

    const includeClause = [
      {
        model: Category,
        as: "category",
        attributes: ["categoryName"],
        ...(categoryFilter && {
          where: {
            categoryName: { [Op.in]: categoryFilter },
          },
          required: true,
        }),
      }
    ];

    const products = await Product.findAll({
      where: whereClause,
      include: includeClause,
      order: orderClause,
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};

// const getAllProducts = async (req, res) => {
//   try {
//     const {
//       minPrice,
//       maxPrice,
//       page = 1,
//       limit = 10,
//       sort = "createdAt_desc",
//     } = req.query;

//     // Build the price filter conditionally
//     const priceFilter = {};
//     if (minPrice) priceFilter[Op.gte] = parseFloat(minPrice);
//     if (maxPrice) priceFilter[Op.lte] = parseFloat(maxPrice);

//     // Build the where clause
//     const whereClause = {
//       status: "approved",
//     };
//     if (Object.keys(priceFilter).length) {
//       whereClause.price = priceFilter;  // Assuming your Product model has a 'price' field
//     }

//     // Pagination
//     const offset = (parseInt(page) - 1) * parseInt(limit);
//     const parsedLimit = parseInt(limit);

//     // Sorting
//     let order = [];
//     switch (sort) {
//       case "price_asc":
//         order = [["price", "ASC"]];
//         break;
//       case "price_desc":
//         order = [["price", "DESC"]];
//         break;
//       case "createdAt_asc":
//         order = [["createdAt", "ASC"]];
//         break;
//       case "createdAt_desc":
//       default:
//         order = [["createdAt", "DESC"]];
//         break;
//     }

//     const { count, rows: products } = await Product.findAndCountAll({
//       where: whereClause,
//       include: [
//         {
//           model: Category,
//           attributes: ["categoryName"],
//         },
//       ],
//       order,
//       offset,
//       limit: parsedLimit,
//     });

//     res.status(200).json({
//       success: true,
//       totalItems: count,
//       totalPages: Math.ceil(count / parsedLimit),
//       currentPage: parseInt(page),
//       products,
//     });
//   } catch (error) {
//     console.error("Get All Products Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching all products",
//       error: error.message,
//     });
//   }
// };
const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryName", "parentCategoryId"],
          include: [
            {
              model: Category,
              as: "parentCategory",
              attributes: ["id", "categoryName"],
            },
          ],
        },
        {
          model: Review,
          as: "reviews",
          attributes: [
            "id",
            "userId",
            "productId",
            "rating",
            "reviewText",
            "reviewPhoto",
            "reviewLike",
            "reviewDate",
            "createdAt",
            "updatedAt",
            // [
            //   // Subquery to count review likes per review
            //   literal(`(
            //     SELECT COUNT(*) 
            //     FROM reviewlikes AS rl 
            //     WHERE rl.reviewId = reviews.id
            //   )`),
            //   "likeCount",
            // ],
          ],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product by ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product by ID",
      error: error.message,
    });
  }
};


const searchProducts = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length < 1) {
    return res.status(400).json({
      success: false,
      message: "Missing or too short search query",
    });
  }

  try {
    const esResult = await elasticClient.search({
      index: "products",
      body: {
        size: 20,
        query: {
          multi_match: {
            query,
            fields: ["productName^3", "productBrand^2", "productTags"],
            type: "phrase_prefix",
          },
        },
      },
    });

    const productIds = esResult.body.hits.hits.map((hit) => hit._source.id);

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        products: [],
      });
    }

    const products = await Product.findAll({
      where: {
        id: productIds,
        status: "approved",
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["categoryName"],
        }
      ],
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Elasticsearch Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching products",
      error: error.message,
    });
  }
};

const getProductsByCategory = async (req, res) => {
  const { categoryName } = req.params;
  try {
    const products = await Product.findAll({
      where: { status: "approved" },
      include: [
        {
          model: Category,
          as: "category",
          where: { categoryName },
          attributes: ["categoryName"],
        }
      ],
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get Products by Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products by category",
      error: error.message,
    });
  }
};

const getProductsByBrand = async (req, res) => {
  const { brandName } = req.params;

  try {
    const products = await Product.findAll({
      where: {
        status: "approved",
        productBrand: { [Op.like]: `%${brandName}%` },
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["categoryName"],
        }
        
      ],
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get Products by Brand Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products by brand",
      error: error.message,
    });
  }
};

const getProductsByCategoryMultiple = async (req, res) => {
  const { categories } = req.query;
  const { categoryName } = req.params;

  const categoryArray = categories
    ? categories.split(",").map((c) => c.trim())
    : categoryName
    ? [categoryName]
    : [];

  console.log("Filtering categories:", categoryArray);

  try {
    const products = await Product.findAll({
      where: { status: "approved" },
      include: [
        {
          model: Category,
          as: "category",
          where:
            categoryArray.length > 0
              ? { categoryName: { [Op.in]: categoryArray } }
              : undefined,
          attributes: ["categoryName"],
        }
      ],
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get Products by Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products by category",
      error: error.message,
    });
  }
};

const getRecentProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: "approved" },
      order: [["createdAt", "DESC"]],
      limit: 10,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["categoryName"],
        }
      ],
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get Recent Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recent products",
      error: error.message,
    });
  }
};

const handleGetQuerySuggestions = async (req, res) => {
  const query = req.query.q;

  if (!query || query.length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  try {
    const result = await elasticClient.search({
      index: "products",
      body: {
        size: 10,
        query: {
          bool: {
            should: [
              {
                match_phrase_prefix: {
                  productName: query,
                },
              },
              {
                match_phrase_prefix: {
                  productBrand: query,
                },
              },
              {
                match_phrase_prefix: {
                  productTags: query,
                },
              },
            ],
          },
        },
        _source: ["productName", "productBrand", "productTags"],
      },
    });

    const suggestionsSet = new Set();

    result.body.hits.hits.forEach((hit) => {
      const { productName, productBrand, productTags } = hit._source;

      if (productName) suggestionsSet.add(productName);
      if (productBrand) suggestionsSet.add(productBrand);
      if (productTags) {
        const tags = productTags.split(",");
        tags.forEach((tag) => suggestionsSet.add(tag.trim()));
      }
    });

    const suggestions = Array.from(suggestionsSet).slice(0, 8);

    res.status(200).json({ success: true, suggestions });
  } catch (err) {
    console.error("OpenSearch suggestion error:", err);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: err.message,
    });
  }
};

const getSimilarProducts = async (req, res) => {
  const { productId } = req.params;

  try {
    const currentProduct = await Product.findByPk(productId);

    if (!currentProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const { productTags, productBrand, productCategoryId } = currentProduct;

    const tagList = productTags
      ? productTags.split(",").map((tag) => tag.trim().toLowerCase())
      : [];

    const similarProducts = await Product.findAll({
      where: {
        id: { [Op.ne]: productId },
        status: "approved",
        [Op.or]: [
          {
            productTags: {
              [Op.or]: tagList.map((tag) => ({
                [Op.like]: `%${tag}%`,
              })),
            },
          },
          {
            productBrand: productBrand
              ? { [Op.like]: `%${productBrand}%` }
              : undefined,
          },
          {
            productCategoryId,
          },
        ],
      },
      limit: 20,
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "productName",
        "productTags",
        "productBrand",
        "productPrice",
        "coverImageUrl",
        "averageCustomerRating",
        "totalCustomerReviews",
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["categoryName"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      similarProducts,
    });
  } catch (error) {
    console.error("Get Similar Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching similar products",
      error: error.message,
    });
  }
};

module.exports = {
  handleAddProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getProductsByBrand,
  getRecentProducts,
  getProductsByCategoryMultiple,
  handleGetQuerySuggestions,
  getSimilarProducts,
   updateFakeGreenScores,
};
