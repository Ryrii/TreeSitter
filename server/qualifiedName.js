export function packageDecl(node) {
    return node.descendantsOfType('scoped_identifier')[0]?.text??node.descendantsOfType('identifier')[0]?.text
}
export function importDecl(node) {
    return node.descendantsOfType('scoped_identifier')[0]?.text??node.descendantsOfType('identifier')[0]?.text+"."+node.descendantsOfType('asterisk')[0]?.text
}

export function classDecl(node) {
    return node.nameNode.text
}
export function classUse(node) {
}
function constructor_declaration(node) {
    // console.log(node.parametersNode)
    return node.nameNode.text
}

export function methDecl(node) {

    var qName = node.nameNode.text  
    return qName;
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
    var qName = node.descendantsOfType('identifier')[0].text
    return qName;

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
    import_declaration : importDecl,
    class_declaration : classDecl,
    method_declaration : methDecl,
    field_declaration : fieldDecl,
    local_variable_declaration : localVarDecl,
    type_identifier : typeIdentifier,
    constructor_declaration : constructor_declaration,
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

