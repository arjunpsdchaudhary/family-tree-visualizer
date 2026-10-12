import { driver } from "@/lib/neo4j";
import {  NextResponse } from "next/server";


export  async function GET(){

    const session = driver.session();

    try{
        const result = await session.run(
            `
            MATCH(c:Canvas {isPublic: true})
            RETURN c
            LIMIT 15;
            `
        );

    const nodes = result.records.map((record) => {
      const node = record.get("c");

      return node.properties;
    });

    return NextResponse.json(
      {
        msg: "successfully fetched",
        trees: nodes,
      },
      { status: 200 },
    );

    }catch(error:any){
        return NextResponse.json({msg:"error occured"},{status:500});

    }
    


}