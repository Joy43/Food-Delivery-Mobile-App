import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GatewayModule } from "../gateway/gateway.module";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";


@Module({
    imports:[AuthModule, GatewayModule ],
    controllers:[MessageController],
    providers:[MessageService],
    exports:[],
    
})

export class MessageModule{}