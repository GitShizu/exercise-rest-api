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
    const Ids = resource.map(elm => elm.id);
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
        if (resource.id === Number(id)) {
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
    isValid &= Object.keys(newResource).length >= 3 && Object.keys(newResource).length <=5;
    if (isValid) {
        resourceProps.forEach((prop) => {
            isValid &= newResource[prop] !== undefined;
        })
    }
    return isValid;
}

app.listen(3000, () => {
    console.log('Server active - port 3000');
})

app.use(express.json());
app.use(morgan('dev'));

//VIEW RESOURCE LIST
app.get('/musicians', (req, res) => {
    const resourceList = readResources('musicians');
    res.send(resourceList);
})

//VIEW RESOURCE BY ID
app.get('/musicians/:id', (req, res) => {
    const resource = checkSingleResource('musicians', req, res)[0];
    res.send(resource);
})

//ADD NEW RESOURCE
app.post('/musicians', (req, res) => {
    const newResource = req.body;
    const resourceProps = ["name", "last_name", "occupation"]
    let validResource = isResourceValid(resourceProps, newResource);
    if(!validResource){
        res.status(400).send(`musicians must include ${resourceProps}. Up to 2 additional properties can be added (max. 5 total)`)
        return;
    }
    const resourceList = readResources('musicians');
    newResource.id = generateId('musicians');
    resourceList.push(newResource)
    writeResources('musicians', resourceList)
    res.send(resourceList);
})

//DELETE RESOURCE BY ID
app.delete('/musicians/:id', (req,res)=>{
    const indexToDelete = checkSingleResource('musicians', req,res)[1];
    const resourceList = readResources('musicians');
    resourceList.splice(indexToDelete, 1);
    writeResources('musicians', resourceList);
    res.send(resourceList);
})