import { GetSystemConfigHandler } from './get.systemconfig';
import { CreateSystemConfigHandler } from '../commands/create.systemconfig';
import { UpdateSystemConfigHandler } from '../commands/update.systemconfig';
import { DeleteSystemConfigHandler } from '../commands/delete.systemconfig';

export const QueryHandlers = [
    GetSystemConfigHandler,
    CreateSystemConfigHandler,
    UpdateSystemConfigHandler,
    DeleteSystemConfigHandler,
];