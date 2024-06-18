export function packageDecl(node) {
    var qName = ""
    const ids = node.descendantsOfType('identifier');
    ids.forEach((id, index) => {
        qName += id.text;
        if (index !== ids.length - 1) {
            qName += ".";
        }
    })
    return qName;
}

export function classDecl(node) {
    var qName = ""
    var packageName = ""
    const parentNode = node.parent;
    const classIndex = parentNode.children.indexOf(node);
    // récup package qui est eu même niveau que la classe (et non sont parent direct)
    for (let i = classIndex - 1; i >= 0; i--) {
        if (parentNode.children[i].type === 'package_declaration') {
            packageName = packageDecl(parentNode.children[i]);
            if (packageName !== "") {
                packageName += ".";
            }
            break;
        }
        if (parentNode.children[i].type !== 'package_declaration' && parentNode.children[i].type !== 'import_declaration') {
            break;
        }
    }
    for (const c of node.children) {
        if (c.type === 'identifier') {
            qName = c.text;
            break;
        }
    }
    qName = node.descendantsOfType('identifier')[0].text;
    return packageName + qName;
}
export function methDecl(node) {
    var qName = ""
    const parentClass = node.closest('class_declaration')
    qName += classDecl(parentClass) + ".";
    for (const c of node.children) {
        if (c.type === 'identifier') {
            qName += c.text;
            break;
            }
            }
            qName += "( ";
    node.descendantsOfType('formal_parameter').map(i => qName+=i.children[0].text+" ");
    qName += ")";
    return qName;
}
export function methUse(node) {
    var qName = ""
    for (const c of node.children) {
        if (c.type === 'identifier') {
            qName = c.text;
            break;
        }
    }
    return qName;
}

export function fieldDecl(node) {
    var qName = ""
    const parentClass = node.closest('class_declaration')
    qName += classDecl(parentClass) + ".";
    for (const c of node.children) {
        if (c.type === 'variable_declarator') {
            qName += c.firstChild.text;
            break;
        }
    }
    return qName;
}

export function localVarDecl(node) {
    
    return node.descendantsOfType('identifier')[0].text;
}
export function typeIdentifier(node) {
    
    return node.text;
}


export const nodeName = {
    program : (node) => {
        return "program";
    },
    package_declaration : packageDecl,
    class_declaration : classDecl,
    method_declaration : methDecl,
    field_declaration : fieldDecl,
    local_variable_declaration : localVarDecl,
    type_identifier : typeIdentifier,
    default : (node) => {
        // Traiter tous les autres cas ici
        // Par exemple, retourner le type de nœud :
        return node.type;
    }
}
export function getNodeName(node) {
    const handler = nodeName[node.type] || nodeName.default;
    return handler(node);
}
