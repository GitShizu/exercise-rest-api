import fs from 'fs';
import path from 'path';
import express from 'express'
import morgan from 'morgan'

const app = express();

//FUNK
const readResources = (resourceType) => {
    const data = fs.readFileSync(path.resolve(`./database/${resourceType}.json`), 'utf-8');
    const resource = JSON.parse(data);
    return resource;
};

const writeResources = (resourceType, newResource) => {
    const data = JSON.stringify(newResource);
    fs.writeFileSync(path.resolve(`./database/${resourceType}.json`), data)
}

const generateId = (resourceType) => {
    const resource = readResources(resourceType);
    const Ids = resource.map(elm => Number(elm.id));
    for (let i = 0; i <= Ids.length; i++) {
        if (!Ids.includes(i)) {
            return i;
        }
    }
}

const checkSingleResource = (resourceType, req, res) => {
    const { id } = req.params;
    const resourceList = readResources(resourceType);
    let referenceIndex;
    for (let i = 0; i < resourceList.length; i++) {
        const resource = resourceList[i];
        if (Number(resource.id) === Number(id)) {
            referenceIndex = i;
            break;
        }
    }
    if (referenceIndex === undefined) {
        res.status(404).send(`No ${resourceType} with ID ${id} were found`);
        return [];
    }
    return [resourceList[referenceIndex], referenceIndex];
}

const isResourceValid = (resourceProps, newResource) => {
    let isValid = true;
    isValid &= Object.keys(newResource).length <= resourceProps.length +2;
    if (isValid) {
        resourceProps.forEach((prop) => {
            isValid &= newResource[prop] !== undefined;
        })
    }
    return isValid;
}
const listenResource = (resourceType, resourceProps) => {
    if (!fs.existsSync(path.resolve(`./database/${resourceType}.json`))) {
        writeResources(resourceType, []);
    }
    //VIEW RESOURCE LIST
    app.get(`/${resourceType}`, (req, res) => {
        const resourceList = readResources(resourceType);
        res.sendFile(path.resolve(`./database/${resourceType}.json`));
    })

    //ADD NEW RESOURCE
    app.post(`/${resourceType}`, (req, res) => {
        const newResource = req.body;
        const isValid = isResourceValid(resourceProps, newResource);
        if (!isValid) {
            res.status(400).send(`${resourceType} must include ${resourceProps}. Up to 2 additional properties can be added (optional)`)
            return;
        }
        const resourceList = readResources(resourceType);
        newResource.id = generateId(resourceType);
        resourceList.push(newResource)
        writeResources(resourceType, resourceList)
        res.send(resourceList);
    })

    //VIEW RESOURCE BY ID
    app.get(`/${resourceType}/:id`, (req, res) => {
        const resource = checkSingleResource(resourceType, req, res)[0];
        res.send(resource);
    })

    //DELETE RESOURCE BY ID
    app.delete(`/${resourceType}/:id`, (req, res) => {
        const indexToDelete = checkSingleResource('musicians', req, res)[1];
        const resourceList = readResources('musicians');
        resourceList.splice(indexToDelete, 1);
        writeResources('musicians', resourceList);
        res.send(resourceList);
    })

    //REPLACE RESOURCE BY ID
    app.put(`/${resourceType}/:id`, (req, res) => {
        const newResource = req.body;
        const isValid = isResourceValid(resourceProps, newResource);
        if (!isValid) {
            res.status(400).send(`${resourceType} must include ${resourceProps}. Up to 2 additional properties can be included (optional)`)
            return;
        };
        const indexToUpdate = checkSingleResource(resourceType, req, res)[1];
        const resourceList = readResources(resourceType);
        resourceList[indexToUpdate] = { ...newResource, id: Number(req.params.id) };
        writeResources(resourceType, resourceList)
        res.send(resourceList);
    })

    //EDIT RESOURCE PROPERTIES BY ID
    app.patch(`/${resourceType}/:id`, (req, res) => {
        const newProps = req.body;
        if (Object.keys(newProps).length > resourceProps.length +1) {
            res.status(400).send(`Up to ${resourceProps.length +1} properties can be edited. To edit all properties use the replace method.`)
            return;
        }
        if(Object.keys(newProps).includes('id')){
            res.status(400).send('the "id" property is read-only')
            return;
        }
        const resourceList = readResources(resourceType);
        const indexToUpdate = checkSingleResource(resourceType, req, res)[1];
        const newResource = { ...resourceList[indexToUpdate], ...newProps }
        let isNewPropsValid = true;
        resourceProps.forEach((prop) => {
            isNewPropsValid &= Object.keys(newResource).includes(prop);
        })
        if (!isNewPropsValid) {
            res.status(400).send(`${resourceType} must include ${resourceProps}. Up to 2 additional properties can be included (optional)`)
            return;
        };
        resourceList[indexToUpdate] = { ...resourceList[indexToUpdate], ...newResource };
        writeResources(resourceType, resourceList)
        res.send(resourceList);
    })
}

app.listen(3000, () => {
    console.log('Server running - listening port 3000');
})

app.use(express.json());
app.use(morgan('dev'));

//ENDPOINTS
listenResource('musicians', ["name", "last_name", "occupation"]);

