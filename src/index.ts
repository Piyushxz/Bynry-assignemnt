import express from "express";

const app = express();


app.get("/api/v1/companies/:company_id/alerts/low_stock",(req,res)=>{
    const company_id = req.params.company_id;

    try{
        // find the company by id assuming we have a function to do this
        let company =  findCompanyById(company_id);

        // if the company does not exist return 404
        if(!company){
            res.status(404).json({
                error: "Company not found"
            })
        }
        // init alerts array
        let alerts = [];

        // find all the users warehouses
        const warehouses = await Warehouse.find({company_id: company_id});
    
        // loop through all the warehouses
        for(const warehouse of warehouses){
            // find all the products in the warehouse
            const products = await Product.find({warehouse_id: warehouse._id});
            
            // for each product if the quantity is less than the threshold then add the alert to the alerts array
            for(const product of products){
                if(product.stock < product.threshold){
                    const supplier = await Supplier.findById(product.supplier_id);
                    // simply push it to the array
                    alerts.push({
                        product_id: product._id,
                        product_name: product.product_name,
                        sku: product.sku,
                        warehouse_id: warehouse._id,
                        warehouse_name: warehouse.warehouse_name,
                        current_stock: product.quantity,
                        threshold: product.threshold,
                        // assuming we have a function to calculate the days until stockout 
                        days_until_stockout: calculateDaysUntilStockout(product._id, product.quantity),
                        supplier: {
                          id: supplier?._id,
                          name: supplier?.supplier_name,
                          contact_email: supplier?.email || "N/A",
                        },
                      });
            }
        }
    
        // final response
        res.json({status: "success", alerts:alerts,total_alerts:alerts.length});
        
    }catch(error){
        // error response
        res.status(500).json({
            error: "Internal server error"
        })
    }


})


app.listen(8080)