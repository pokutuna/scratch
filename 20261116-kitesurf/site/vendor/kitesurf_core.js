// TYPED-COPY-MARKER-v1 — see scripts/build-wasm.mjs post-pass
// Module-private captures: page JS must not be able to observe the bytes copied into
// wasm memory, nor supply the view they are copied through.
const __ksReflectApply = Reflect.apply;
const __ksUint8Array = Uint8Array;
const __ksUint8ArraySet = Uint8Array.prototype.set;
// TERMINATED-HOOK-MARKER-v1 — see scripts/build-wasm.mjs post-pass
let __ksOnTerminated = null;
export function __setOnTerminated(fn) {
  __ksOnTerminated = fn;
}
// HIDDEN-BRIDGE-MARKER-v1 — see scripts/build-wasm.mjs post-pass
// Module-private capture of the JS-side fetchResource bridge.
// Set exactly once by the bootstrap path via
// __setBridgeFetchResource(fn) before initSync(wasm). After
// that the wasm-bindgen imports object calls through this
// binding instead of via globalThis, which means page JS has
// no reachable handle to override or call it.
let __bridgeFetchResource = null;
export function __setBridgeFetchResource(fn) {
  if (typeof fn !== "function") {
    throw new TypeError(
      "__setBridgeFetchResource: fn must be a function",
    );
  }
  __bridgeFetchResource = fn;
}
/* @ts-self-types="./kitesurf_core.d.ts" */

/**
 * Holds one page's DOM and associated mutable state behind the Wasm handle.
 * Dropping the handle releases that state; Boa fast-path references hold only weak links.
 */
export class DomHandle {
    static __wrap(ptr) {
        const obj = Object.create(DomHandle.prototype);
        obj.__wbg_ptr = ptr;
        DomHandleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DomHandleFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_domhandle_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @param {number} parent_id
     * @param {number} child_id
     * @returns {boolean}
     */
    appendChildNode(parent_id, child_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_appendChildNode(this.__wbg_ptr, parent_id, child_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {string} json
     * @returns {number}
     */
    applyOps(json) {
        const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_applyOps(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * @param {number} slot_id
     * @returns {Uint32Array}
     */
    assignedNodesOf(slot_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_assignedNodesOf(this.__wbg_ptr, slot_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} node_id
     * @returns {number}
     */
    assignedSlotOf(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_assignedSlotOf(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {number} host_id
     * @param {string} mode
     * @returns {number}
     */
    attachShadow(host_id, mode) {
        const ptr0 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_attachShadow(this.__wbg_ptr, host_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @returns {string}
     */
    baseURL() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_baseURL(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} selector
     * @returns {string | undefined}
     */
    canonicalizeSelector(selector) {
        const ptr0 = passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canonicalizeSelector(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v2;
        if (ret[0] !== 0) {
            v2 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v2;
    }
    /**
     * @param {string} selector
     * @param {Record<string, string>} prefixes
     * @returns {string | undefined}
     */
    canonicalizeSelectorNs(selector, prefixes) {
        const ptr0 = passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canonicalizeSelectorNs(this.__wbg_ptr, ptr0, len0, prefixes);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v2;
        if (ret[0] !== 0) {
            v2 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v2;
    }
    /**
     * @param {number} node_id
     * @param {string} ops_json
     * @returns {number}
     */
    canvasApplyOps(node_id, ops_json) {
        const ptr0 = passStringToWasm0(ops_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canvasApplyOps(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {number} node_id
     * @returns {Uint8Array}
     */
    canvasEncodePng(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canvasEncodePng(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {number} node_id
     * @returns {number}
     */
    canvasFlush(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canvasFlush(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {number} node_id
     * @param {number} sx
     * @param {number} sy
     * @param {number} sw
     * @param {number} sh
     * @returns {Uint8Array}
     */
    canvasGetImageData(node_id, sx, sy, sw, sh) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canvasGetImageData(this.__wbg_ptr, node_id, sx, sy, sw, sh);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {number} node_id
     * @returns {boolean}
     */
    canvasIsOriginClean(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canvasIsOriginClean(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @param {number} x
     * @param {number} y
     * @param {boolean} even_odd
     * @returns {boolean}
     */
    canvasIsPointInPath(node_id, x, y, even_odd) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canvasIsPointInPath(this.__wbg_ptr, node_id, x, y, even_odd);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {string} text
     * @param {string} font
     * @returns {string}
     */
    canvasMeasureText(text, font) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(font, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_canvasMeasureText(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred3_0 = ret[0];
            deferred3_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} node_id
     * @param {number} dx
     * @param {number} dy
     * @param {number} width
     * @param {number} height
     * @param {Uint8Array} rgba
     * @returns {number}
     */
    canvasPutImageData(node_id, dx, dy, width, height, rgba) {
        const ptr0 = passArray8ToWasm0(rgba, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canvasPutImageData(this.__wbg_ptr, node_id, dx, dy, width, height, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {string} css
     * @returns {string}
     */
    canvasSerializeColor(css) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(css, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_canvasSerializeColor(this.__wbg_ptr, ptr0, len0);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} node_id
     * @returns {{ kind: "canvas" | "img"; src: string } | null}
     */
    canvasSourceInfo(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_canvasSourceInfo(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @returns {any}
     */
    caretFromPoint(x, y) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_caretFromPoint(this.__wbg_ptr, x, y);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {number} node_id
     * @returns {Uint32Array}
     */
    childIds(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_childIds(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} node_id
     */
    clearCanvasPixels(node_id) {
        __wbg_call_guard();
        try {
            wasm.domhandle_clearCanvasPixels(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    clearDomSelection() {
        __wbg_call_guard();
        try {
            wasm.domhandle_clearDomSelection(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    clearFocus() {
        __wbg_call_guard();
        try {
            wasm.domhandle_clearFocus(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} node_id
     */
    clearIframeImage(node_id) {
        __wbg_call_guard();
        try {
            wasm.domhandle_clearIframeImage(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} node_id
     * @param {string} selector
     * @returns {number}
     */
    closestInTree(node_id, selector) {
        const ptr0 = passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_closestInTree(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * @param {number} node_id
     * @returns {any}
     */
    computedStyle(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_computedStyle(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} node_id
     * @param {string} pseudo
     * @returns {any}
     */
    computedStylePseudo(node_id, pseudo) {
        const ptr0 = passStringToWasm0(pseudo, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_computedStylePseudo(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} node_id
     * @param {string} name
     * @returns {string | undefined}
     */
    computedStyleValue(node_id, name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_computedStyleValue(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v2;
        if (ret[0] !== 0) {
            v2 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v2;
    }
    /**
     * @param {number} node_id
     * @returns {number}
     */
    containingShadowRootId(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_containingShadowRootId(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {string} text
     * @returns {number}
     */
    createComment(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_createComment(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {string} tag_name
     * @returns {number}
     */
    createElement(tag_name) {
        const ptr0 = passStringToWasm0(tag_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_createElement(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {string} namespace_uri
     * @param {string} qualified_name
     * @returns {number}
     */
    createElementNS(namespace_uri, qualified_name) {
        const ptr0 = passStringToWasm0(namespace_uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(qualified_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_createElementNS(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {string} local_name
     * @param {string} namespace_uri
     * @returns {number}
     */
    createElementVerbatim(local_name, namespace_uri) {
        const ptr0 = passStringToWasm0(local_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(namespace_uri, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_createElementVerbatim(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {string} text
     * @returns {number}
     */
    createTextNode(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_createTextNode(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {number} node_id
     * @returns {string}
     */
    debugDumpBorderColors(node_id) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_debugDumpBorderColors(this.__wbg_ptr, node_id);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {string}
     */
    debugDumpInlineLayouts() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_debugDumpInlineLayouts(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {string}
     */
    debugDumpLineOffsets() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_debugDumpLineOffsets(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} node_id
     * @returns {string}
     */
    debugDumpNodeChildren(node_id) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_debugDumpNodeChildren(this.__wbg_ptr, node_id);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} node_id
     * @returns {string}
     */
    debugDumpNodeLayout(node_id) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_debugDumpNodeLayout(this.__wbg_ptr, node_id);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} node_id
     * @returns {string}
     */
    debugDumpPseudoElements(node_id) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_debugDumpPseudoElements(this.__wbg_ptr, node_id);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} node_id
     * @returns {number}
     */
    deepCloneNode(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_deepCloneNode(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {number} request_id
     * @param {Uint8Array} bytes
     * @param {string} resource_key
     * @returns {boolean}
     */
    deliverFontResource(request_id, bytes, resource_key) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(resource_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_deliverFontResource(this.__wbg_ptr, request_id, ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} request_id
     * @param {Uint8Array} bytes
     * @returns {boolean}
     */
    deliverResource(request_id, bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_deliverResource(this.__wbg_ptr, request_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * Settle a pending fetch with an empty body.
     * Returns `false` if its request ID is no longer pending.
     * @param {number} request_id
     * @returns {boolean}
     */
    deliverResourceError(request_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_deliverResourceError(this.__wbg_ptr, request_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} request_id
     * @param {string} resource_key
     * @param {number} width
     * @param {number} height
     * @returns {boolean}
     */
    deliverResourceMeta(request_id, resource_key, width, height) {
        const ptr0 = passStringToWasm0(resource_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_deliverResourceMeta(this.__wbg_ptr, request_id, ptr0, len0, width, height);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @returns {Uint32Array}
     */
    descendantsOf(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_descendantsOf(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {Uint32Array} node_ids
     * @returns {Int32Array}
     */
    detachedRoots(node_ids) {
        const ptr0 = passArray32ToWasm0(node_ids, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_detachedRoots(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v2 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * @returns {number}
     */
    discoverPendingImages() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_discoverPendingImages(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    documentNodeId() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_documentNodeId(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {number} node_id
     * @returns {boolean}
     */
    dropNode(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_dropNode(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    elementFromPoint(x, y) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_elementFromPoint(this.__wbg_ptr, x, y);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {Function} brand
     * @param {Function} revalidate
     * @param {Function} wrapper
     * @param {Function | null} [peek]
     * @param {Function | null} [node_list]
     */
    fastpathBind(brand, revalidate, wrapper, peek, node_list) {
        __wbg_call_guard();
        try {
            wasm.domhandle_fastpathBind(this.__wbg_ptr, brand, revalidate, wrapper, isLikeNone(peek) ? 0 : addToExternrefTable0(peek), isLikeNone(node_list) ? 0 : addToExternrefTable0(node_list));
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} node_id
     */
    fastpathMarkSpecial(node_id) {
        __wbg_call_guard();
        try {
            wasm.domhandle_fastpathMarkSpecial(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @returns {string}
     */
    fastpathStats() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_fastpathStats(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    fontsUpgraded() {
        __wbg_call_guard();
        try {
            wasm.domhandle_fontsUpgraded(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @returns {number}
     */
    forceFullRestyle() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_forceFullRestyle(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {Uint8Array} bytes
     * @param {string} base_url
     * @returns {DomHandle}
     */
    static fromSerialized(bytes, base_url) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_fromSerialized(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return DomHandle.__wrap(ret[0]);
    }
    /**
     * @param {number} node_id
     * @returns {KsLayoutRect | null}
     */
    getBoundingClientRect(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_getBoundingClientRect(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} node_id
     * @returns {string}
     */
    getCommentData(node_id) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_getCommentData(this.__wbg_ptr, node_id);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {KsNodeInfo | null}
     */
    getDocument() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_getDocument(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} id
     * @returns {number}
     */
    getElementById(id) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_getElementById(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @returns {number}
     */
    getFocusedNodeId() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_getFocusedNodeId(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @returns {boolean}
     */
    hasPendingCriticalResources() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_hasPendingCriticalResources(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    hasPendingTransitions() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_hasPendingTransitions(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {string} url
     * @returns {boolean}
     */
    imageCacheHas(url) {
        const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_imageCacheHas(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @returns {boolean}
     */
    imageIsPending(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_imageIsPending(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @returns {Uint32Array}
     */
    imageNaturalSize(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_imageNaturalSize(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Document-space ink bounds for the transformed border box and descendants.
     * Null means no box. Partial frames use it for transform-only damage.
     * @param {number} node_id
     * @returns {Float64Array | undefined}
     */
    inkRect(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_inkRect(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        }
        return v1;
    }
    /**
     * @param {number} node_id
     * @returns {string}
     */
    innerHTML(node_id) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_innerHTML(this.__wbg_ptr, node_id);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} node_id
     * @returns {string | null}
     */
    innerTextRendered(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_innerTextRendered(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {number} parent_id
     * @param {number} new_child_id
     * @param {number} ref_child_id
     * @returns {boolean}
     */
    insertBeforeNode(parent_id, new_child_id, ref_child_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_insertBeforeNode(this.__wbg_ptr, parent_id, new_child_id, ref_child_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * Compute one Intersection Observer geometry result.
     * Margins are four `[value, is_percent]` pairs in top, right, bottom, left order.
     * @param {number} target_id
     * @param {number} root_id
     * @param {Float32Array} root_margin
     * @param {Float32Array} scroll_margin
     * @param {number} scroll_x
     * @param {number} scroll_y
     * @param {boolean} resolve
     * @returns {string}
     */
    intersectionGeometry(target_id, root_id, root_margin, scroll_margin, scroll_x, scroll_y, resolve) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passArrayF32ToWasm0(root_margin, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF32ToWasm0(scroll_margin, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_intersectionGeometry(this.__wbg_ptr, target_id, root_id, ptr0, len0, ptr1, len1, scroll_x, scroll_y, resolve);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {boolean}
     */
    isAnimating() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_isAnimating(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} ancestor_id
     * @param {number} node_id
     * @returns {boolean}
     */
    isInclusiveAncestor(ancestor_id, node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_isInclusiveAncestor(this.__wbg_ptr, ancestor_id, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    isPoisoned() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_isPoisoned(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * Deliberately does NOT resolve: IntersectionObserver samples the last committed layout.
     * @returns {boolean}
     */
    layoutClean() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_layoutClean(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * Never resolves itself. With layoutClean, a poll whose epoch is
     * unchanged knows no box moved, so it can skip its geometry reads.
     * @returns {number}
     */
    layoutEpoch() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_layoutEpoch(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    layoutMode() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_layoutMode(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} node_id
     * @param {string} selector
     * @returns {boolean}
     */
    matchesInSubtree(node_id, selector) {
        const ptr0 = passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_matchesInSubtree(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * Byte-taking twin of `matchesInSubtree`. Selector text can come from a sheet the page
     * cannot read, and wasm-bindgen marshals `&str` through `charCodeAt`/`encodeInto`, which
     * page JS can replace. The caller encodes the text itself and passes the bytes instead.
     * Invalid UTF-8 matches nothing.
     * @param {number} node_id
     * @param {Uint8Array} selector
     * @returns {boolean}
     */
    matchesInSubtreeBytes(node_id, selector) {
        const ptr0 = passArray8ToWasm0(selector, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_matchesInSubtreeBytes(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * Parse `html` into a page document and use `base_url` for relative resources.
     * Invalid URLs and URLs that cannot serve as a base use `https://kitesurf.local/`.
     * @param {string} html
     * @param {string} base_url
     */
    constructor(html, base_url) {
        const ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_new(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        this.__wbg_ptr = ret;
        DomHandleFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {number}
     */
    nodeCount() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_nodeCount(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {number} node_id
     * @returns {KsNodeInfo | null}
     */
    nodeInfo(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_nodeInfo(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} node_id
     * @returns {KsScrollInfo | null}
     */
    nodeScrollInfo(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_nodeScrollInfo(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} node_id
     * @returns {KsNodeInfo | null}
     */
    nodeSubtree(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_nodeSubtree(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {number}
     */
    nonLatinTextWrites() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_nonLatinTextWrites(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {any}
     */
    notRenderedNodeIds() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_notRenderedNodeIds(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} node_id
     * @returns {KsOffsetMetrics | null}
     */
    offsetMetrics(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_offsetMetrics(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} node_id
     * @returns {string}
     */
    outerHTML(node_id) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_outerHTML(this.__wbg_ptr, node_id);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {string}
     */
    pageBoxJson() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_pageBoxJson(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * Start counting the damage a caller attributes to its next input; what was
     * already pending goes to the screencast, so it is never read as the input's.
     */
    paintDamageMark() {
        __wbg_call_guard();
        try {
            wasm.domhandle_paintDamageMark(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * Nodes damaged since the last mark or read, as JSON `{ids, overflow}`, leaving out
     * `exclude`, its subtree and its ancestors: a control's own hover and focus restyle.
     * @param {number} exclude
     * @returns {string}
     */
    paintDamageSince(exclude) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_paintDamageSince(this.__wbg_ptr, exclude);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} kind
     * @returns {number}
     */
    panicProbe(kind) {
        const ptr0 = passStringToWasm0(kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_panicProbe(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {number} node_id
     * @returns {number}
     */
    parentId(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_parentId(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @returns {string[]}
     */
    pendingAuthorFontUpgrades() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_pendingAuthorFontUpgrades(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string} url
     * @returns {Uint32Array}
     */
    pendingImageNodes(url) {
        const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_pendingImageNodes(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v2 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * @returns {number}
     */
    pendingImagesCount() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_pendingImagesCount(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {Float64Array | undefined}
     */
    pinnedRects() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_pinnedRects(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        }
        return v1;
    }
    /**
     * @param {number} width
     * @param {number} height
     * @returns {number}
     */
    prepareForPaint(width, height) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_prepareForPaint(this.__wbg_ptr, width, height);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    pseudoKindAtPoint(x, y) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_pseudoKindAtPoint(this.__wbg_ptr, x, y);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    pumpResourceMessages() {
        __wbg_call_guard();
        try {
            wasm.domhandle_pumpResourceMessages(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {string} selector
     * @returns {number}
     */
    querySelector(selector) {
        const ptr0 = passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_querySelector(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * @param {string} selector
     * @returns {Int32Array}
     */
    querySelectorAll(selector) {
        const ptr0 = passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_querySelectorAll(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * @param {number} root_id
     * @param {string} selector
     * @returns {Int32Array}
     */
    querySelectorAllInSubtree(root_id, selector) {
        const ptr0 = passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_querySelectorAllInSubtree(this.__wbg_ptr, root_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * @param {number} width
     * @param {number} height
     * @param {number} margin_top
     * @param {number} margin_right
     * @param {number} margin_bottom
     * @param {number} margin_left
     * @returns {Uint8Array}
     */
    recordPdfScenes(width, height, margin_top, margin_right, margin_bottom, margin_left) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_recordPdfScenes(this.__wbg_ptr, width, height, margin_top, margin_right, margin_bottom, margin_left);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {number} node_id
     * @param {string} name
     * @returns {boolean}
     */
    removeAttribute(node_id, name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_removeAttribute(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @returns {boolean}
     */
    removeNode(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_removeNode(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {Uint8Array} glyph_hashes
     * @param {Uint8Array} font_metric_hashes
     * @param {Uint8Array} image_hashes
     * @param {Uint8Array} font_data_hashes
     * @returns {Uint8Array}
     */
    renderRbiResources(glyph_hashes, font_metric_hashes, image_hashes, font_data_hashes) {
        const ptr0 = passArray8ToWasm0(glyph_hashes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(font_metric_hashes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(image_hashes, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray8ToWasm0(font_data_hashes, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_renderRbiResources(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v5;
    }
    /**
     * @param {number} scroll_x
     * @param {number} scroll_y
     * @param {number} overdraw_top
     * @param {number} overdraw_bottom
     * @param {boolean} omit_background
     * @param {boolean} client_wire
     * @returns {Uint8Array}
     */
    renderScene(scroll_x, scroll_y, overdraw_top, overdraw_bottom, omit_background, client_wire) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_renderScene(this.__wbg_ptr, scroll_x, scroll_y, overdraw_top, overdraw_bottom, omit_background, client_wire);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {number} clip_x
     * @param {number} clip_y
     * @param {number} clip_w
     * @param {number} clip_h
     * @param {boolean} omit_background
     * @param {boolean} client_wire
     * @returns {Uint8Array}
     */
    renderSceneClip(clip_x, clip_y, clip_w, clip_h, omit_background, client_wire) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_renderSceneClip(this.__wbg_ptr, clip_x, clip_y, clip_w, clip_h, omit_background, client_wire);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {number} clip_x
     * @param {number} clip_y
     * @param {number} clip_w
     * @param {number} clip_h
     * @param {boolean} omit_background
     * @param {boolean} client_wire
     * @returns {Uint8Array}
     */
    renderSceneClipRaw(clip_x, clip_y, clip_w, clip_h, omit_background, client_wire) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_renderSceneClipRaw(this.__wbg_ptr, clip_x, clip_y, clip_w, clip_h, omit_background, client_wire);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} scene
     * @param {Uint8Array} have_images
     * @param {Uint8Array} have_fonts
     * @returns {Uint8Array}
     */
    renderSceneInlineResources(scene, have_images, have_fonts) {
        const ptr0 = passArray8ToWasm0(scene, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(have_images, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(have_fonts, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_renderSceneInlineResources(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v4;
    }
    /**
     * @param {number} scroll_x
     * @param {number} scroll_y
     * @param {number} overdraw_top
     * @param {number} overdraw_bottom
     * @param {boolean} omit_background
     * @param {boolean} client_wire
     * @returns {Uint8Array}
     */
    renderSceneRaw(scroll_x, scroll_y, overdraw_top, overdraw_bottom, omit_background, client_wire) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_renderSceneRaw(this.__wbg_ptr, scroll_x, scroll_y, overdraw_top, overdraw_bottom, omit_background, client_wire);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Keeps the raw scene in linear memory; `stagedScenePtr` locates its
     * bytes until the next call. JS can copy them into a pooled ArrayBuffer
     * instead of allocating one for every canvas frame.
     * @param {number} scroll_x
     * @param {number} scroll_y
     * @param {number} overdraw_top
     * @param {number} overdraw_bottom
     * @param {boolean} omit_background
     * @param {boolean} client_wire
     * @returns {number}
     */
    renderSceneRawStaged(scroll_x, scroll_y, overdraw_top, overdraw_bottom, omit_background, client_wire) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_renderSceneRawStaged(this.__wbg_ptr, scroll_x, scroll_y, overdraw_top, overdraw_bottom, omit_background, client_wire);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {number} scroll_x
     * @param {number} scroll_y
     * @returns {string}
     */
    renderSceneRoundtrip(scroll_x, scroll_y) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_renderSceneRoundtrip(this.__wbg_ptr, scroll_x, scroll_y);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} scroll_x
     * @param {number} scroll_y
     * @returns {string}
     */
    renderSceneStats(scroll_x, scroll_y) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_renderSceneStats(this.__wbg_ptr, scroll_x, scroll_y);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} new_child_id
     * @param {number} old_child_id
     * @returns {boolean}
     */
    replaceChildNode(new_child_id, old_child_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_replaceChildNode(this.__wbg_ptr, new_child_id, old_child_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * ResizeObserver's two boxes in one call: `[contentWidth, contentHeight, borderWidth,
     * borderHeight]` from the layout box, so transforms do not count. A node that generates no
     * box measures zero. Empty when there is no layout to read, so the caller falls back to its
     * CSSOM reads. With `resolve` false this reads the last committed layout.
     * @param {number} node_id
     * @param {boolean} resolve
     * @returns {Float32Array}
     */
    resizeObserverBoxes(node_id, resolve) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_resizeObserverBoxes(this.__wbg_ptr, node_id, resolve);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `[mutationResolves, animationResolves]` since the document was built.
     * @returns {Uint32Array}
     */
    resolveCounts() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_resolveCounts(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    resolveLayout() {
        __wbg_call_guard();
        try {
            wasm.domhandle_resolveLayout(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} node_id
     * @param {number} dx
     * @param {number} dy
     * @returns {boolean}
     */
    scrollNodeBy(node_id, dx, dy) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_scrollNodeBy(this.__wbg_ptr, node_id, dx, dy);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_serialize(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Whether the resolve should collect CSS animation events. Only
     * true while the isolate has an `animation*` listener; see the
     * `animation_events_requested` field docs. Flips on
     * `armTransitionDrain(true/false)` in page-script.
     * @param {boolean} requested
     */
    setAnimationEventsRequested(requested) {
        __wbg_call_guard();
        try {
            wasm.domhandle_setAnimationEventsRequested(this.__wbg_ptr, requested);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} node_id
     * @param {string} name
     * @param {string} value
     * @returns {boolean}
     */
    setAttribute(node_id, name, value) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setAttribute(this.__wbg_ptr, node_id, ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @param {number} width
     * @param {number} height
     * @param {Uint8Array} rgba
     * @returns {number}
     */
    setCanvasPixels(node_id, width, height, rgba) {
        const ptr0 = passArray8ToWasm0(rgba, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setCanvasPixels(this.__wbg_ptr, node_id, width, height, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * Update live checkedness and restyle the input and parent for `:checked` siblings.
     * The `checked` attribute is `defaultChecked` and stays untouched; rebuilt paint documents
     * serialize live checkedness instead. Returns false for stale or non-checkable IDs.
     * @param {number} node_id
     * @param {boolean} checked
     * @returns {boolean}
     */
    setCheckboxChecked(node_id, checked) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setCheckboxChecked(this.__wbg_ptr, node_id, checked);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @param {string} text
     * @returns {boolean}
     */
    setCommentData(node_id, text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setCommentData(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} anchor_id
     * @param {number} anchor_offset
     * @param {number} focus_id
     * @param {number} focus_offset
     * @returns {boolean}
     */
    setDomSelection(anchor_id, anchor_offset, focus_id, focus_offset) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setDomSelection(this.__wbg_ptr, anchor_id, anchor_offset, focus_id, focus_offset);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @returns {boolean}
     */
    setFocus(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setFocus(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @param {number} width
     * @param {number} height
     * @param {Uint8Array} rgba
     * @returns {number}
     */
    setIframeImage(node_id, width, height, rgba) {
        const ptr0 = passArray8ToWasm0(rgba, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setIframeImage(this.__wbg_ptr, node_id, width, height, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {number} node_id
     * @param {number} start
     * @param {number} end
     * @returns {boolean}
     */
    setInputSelection(node_id, start, end) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setInputSelection(this.__wbg_ptr, node_id, start, end);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} node_id
     * @param {string} value
     * @returns {boolean}
     */
    setInputText(node_id, value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setInputText(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {string} mode
     */
    setLayoutMode(mode) {
        const ptr0 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        __wbg_call_guard();
        try {
            wasm.domhandle_setLayoutMode(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {string} media
     */
    setMediaType(media) {
        const ptr0 = passStringToWasm0(media, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        __wbg_call_guard();
        try {
            wasm.domhandle_setMediaType(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} node_id
     * @param {number} x
     * @param {number} y
     * @returns {KsScrollOffset | null}
     */
    setNodeScrollOffset(node_id, x, y) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setNodeScrollOffset(this.__wbg_ptr, node_id, x, y);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} node_id
     * @param {string} text
     * @returns {boolean}
     */
    setNodeText(node_id, text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setNodeText(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    setPageScroll(x, y) {
        __wbg_call_guard();
        try {
            wasm.domhandle_setPageScroll(this.__wbg_ptr, x, y);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} node_id
     * @param {string | null} [text]
     * @returns {boolean}
     */
    setSelectLabel(node_id, text) {
        var ptr0 = isLikeNone(text) ? 0 : passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_setSelectLabel(this.__wbg_ptr, node_id, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} width
     * @param {number} height
     */
    setViewport(width, height) {
        __wbg_call_guard();
        try {
            wasm.domhandle_setViewport(this.__wbg_ptr, width, height);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} node_id
     * @returns {number}
     */
    shadowHostId(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_shadowHostId(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @param {number} host_id
     * @returns {number}
     */
    shadowRootId(host_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_shadowRootId(this.__wbg_ptr, host_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * Address of the last staged scene in linear memory.
     * @returns {number}
     */
    stagedScenePtr() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_stagedScenePtr(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {number} node_id
     * @returns {Float32Array}
     */
    stickyShift(node_id) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_stickyShift(this.__wbg_ptr, node_id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Does not resolve, like `takeTransitionEvents`.
     * @returns {any}
     */
    takeAnimationEvents() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_takeAnimationEvents(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {string}
     */
    takeDamageSummary() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_takeDamageSummary(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * Does not resolve. The drain tick in transitions.ts decides whether its turn needs
     * `resolveLayout`; a resolve here would re-cascade every running animation on each tick.
     * @returns {any}
     */
    takeTransitionEvents() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_takeTransitionEvents(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number} node_id
     * @returns {string}
     */
    textContent(node_id) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_textContent(this.__wbg_ptr, node_id);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {Uint32Array} ranges
     * @returns {boolean}
     */
    textUsesCodepoints(ranges) {
        const ptr0 = passArray32ToWasm0(ranges, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_textUsesCodepoints(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    title() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.domhandle_title(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {Uint32Array}
     */
    viewportSize() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_viewportSize(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Return `getComputedTiming()` fields from the same model sampled by the cascade.
     * Returns `[phase, activeDuration, endTime, progress, currentIteration]`; phase is 0
     * before, 1 active, 2 after, 3 idle. Missing progress or iteration is NaN; the shim maps
     * it to null.
     * @param {Float64Array} timing
     * @param {string} easing
     * @param {number | null | undefined} local_time
     * @param {number} rate
     * @returns {Float64Array}
     */
    waapiComputedTiming(timing, easing, local_time, rate) {
        const ptr0 = passArrayF64ToWasm0(timing, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(easing, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_waapiComputedTiming(this.__wbg_ptr, ptr0, len0, ptr1, len1, !isLikeNone(local_time), isLikeNone(local_time) ? 0 : local_time, rate);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v3;
    }
    /**
     * Drop animation `id` (canceled, or its Animation collected); its target restyles
     * without it on the next resolve.
     * @param {number} id
     */
    waapiRemove(id) {
        __wbg_call_guard();
        try {
            wasm.domhandle_waapiRemove(this.__wbg_ptr, id);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * Create or replace animation `id`'s keyframe effect on `node_id` (0: no target).
     * Errs with the TypeError message Chrome throws for an invalid easing.
     * @param {number} id
     * @param {number} node_id
     * @param {string} keyframes_json
     * @param {Float64Array} timing
     * @param {string} easing
     */
    waapiSetEffect(id, node_id, keyframes_json, timing, easing) {
        const ptr0 = passStringToWasm0(keyframes_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(timing, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(easing, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.domhandle_waapiSetEffect(this.__wbg_ptr, id, node_id, ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Animation `id`'s current time is `hold_ms` when given, else the animation clock
     * (Date.now()-based epoch ms, as `now_for_animations`) since `start_epoch_ms` at `rate`.
     * @param {number} id
     * @param {number | null | undefined} start_epoch_ms
     * @param {number | null | undefined} hold_ms
     * @param {number} rate
     */
    waapiSetPlayback(id, start_epoch_ms, hold_ms, rate) {
        __wbg_call_guard();
        try {
            wasm.domhandle_waapiSetPlayback(this.__wbg_ptr, id, !isLikeNone(start_epoch_ms), isLikeNone(start_epoch_ms) ? 0 : start_epoch_ms, !isLikeNone(hold_ms), isLikeNone(hold_ms) ? 0 : hold_ms, rate);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}
if (Symbol.dispose) DomHandle.prototype[Symbol.dispose] = DomHandle.prototype.free;

export class KeyOutcome {
    static __wrap(ptr) {
        const obj = Object.create(KeyOutcome.prototype);
        obj.__wbg_ptr = ptr;
        KeyOutcomeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        KeyOutcomeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_keyoutcome_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @returns {boolean}
     */
    get handled() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.keyoutcome_handled(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {string | undefined}
     */
    get navigate() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.keyoutcome_navigate(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {boolean}
     */
    get redraw() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.keyoutcome_redraw(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
}
if (Symbol.dispose) KeyOutcome.prototype[Symbol.dispose] = KeyOutcome.prototype.free;

export class ModePicker {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ModePickerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_modepicker_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    close() {
        __wbg_call_guard();
        try {
            wasm.modepicker_close(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @returns {string}
     */
    currentSlug() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.modepicker_currentSlug(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} key
     * @returns {PickResult}
     */
    handleKey(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.modepicker_handleKey(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return PickResult.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    isOpen() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.modepicker_isOpen(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {string} current
     */
    constructor(current) {
        const ptr0 = passStringToWasm0(current, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.modepicker_new(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        this.__wbg_ptr = ret;
        ModePickerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    open() {
        __wbg_call_guard();
        try {
            wasm.modepicker_open(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} col
     * @param {number} row
     * @param {number} cols
     * @param {number} rows
     * @returns {PickResult}
     */
    pressAt(col, row, cols, rows) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.modepicker_pressAt(this.__wbg_ptr, col, row, cols, rows);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return PickResult.__wrap(ret);
    }
    /**
     * @param {number} cols
     * @param {number} rows
     * @returns {string}
     */
    render(cols, rows) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.modepicker_render(this.__wbg_ptr, cols, rows);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} slug
     */
    setCurrent(slug) {
        const ptr0 = passStringToWasm0(slug, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        __wbg_call_guard();
        try {
            wasm.modepicker_setCurrent(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}
if (Symbol.dispose) ModePicker.prototype[Symbol.dispose] = ModePicker.prototype.free;

export class Omni {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OmniFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_omni_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    beginEdit() {
        __wbg_call_guard();
        try {
            wasm.omni_beginEdit(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @returns {boolean}
     */
    canBack() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_canBack(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    canForward() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_canForward(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    cancelEdit() {
        __wbg_call_guard();
        try {
            wasm.omni_cancelEdit(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @returns {boolean}
     */
    clear_hover() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_clear_hover(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {string | undefined}
     */
    commitEdit() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_commitEdit(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    currentUrl() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.omni_currentUrl(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} cols
     * @returns {number | undefined}
     */
    cursorCol(cols) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_cursorCol(this.__wbg_ptr, cols);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret === Number.MAX_SAFE_INTEGER ? undefined : ret;
    }
    /**
     * @returns {number}
     */
    editCursor() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_editCursor(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    editText() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.omni_editText(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} key
     * @param {string} text
     * @param {boolean} alt
     * @param {boolean} ctrl
     * @returns {KeyOutcome}
     */
    handleKey(key, text, alt, ctrl) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_handleKey(this.__wbg_ptr, ptr0, len0, ptr1, len1, alt, ctrl);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return KeyOutcome.__wrap(ret);
    }
    /**
     * @param {number} col
     * @param {number} cols
     * @returns {string}
     */
    hitName(col, cols) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.omni_hitName(this.__wbg_ptr, col, cols);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} col
     * @param {number} cols
     * @returns {boolean}
     */
    hover_at(col, cols) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_hover_at(this.__wbg_ptr, col, cols);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    isEditing() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_isEditing(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    isLoading() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_isLoading(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {string} url
     */
    constructor(url) {
        const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_new(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        this.__wbg_ptr = ret;
        OmniFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    notePainted() {
        __wbg_call_guard();
        try {
            wasm.omni_notePainted(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} col
     * @param {number} cols
     * @param {boolean} on_chrome
     * @returns {PressOutcome}
     */
    pressAt(col, cols, on_chrome) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_pressAt(this.__wbg_ptr, col, cols, on_chrome);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return PressOutcome.__wrap(ret);
    }
    /**
     * @param {string} s
     */
    pushText(s) {
        const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        __wbg_call_guard();
        try {
            wasm.omni_pushText(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {string} c
     */
    push_char(c) {
        const char0 = c.codePointAt(0);
        _assertChar(char0);
        __wbg_call_guard();
        try {
            wasm.omni_push_char(this.__wbg_ptr, char0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {number} cols
     * @returns {string}
     */
    render(cols) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.omni_render(this.__wbg_ptr, cols);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} cols
     * @returns {string}
     */
    renderRule(cols) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.omni_renderRule(this.__wbg_ptr, cols);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {boolean} v
     */
    setLoading(v) {
        __wbg_call_guard();
        try {
            wasm.omni_setLoading(this.__wbg_ptr, v);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {string} url
     * @param {boolean} can_back
     * @param {boolean} can_fwd
     * @param {boolean} loading
     * @returns {boolean}
     */
    setNav(url, can_back, can_fwd, loading) {
        const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_setNav(this.__wbg_ptr, ptr0, len0, can_back, can_fwd, loading);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    tick() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.omni_tick(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
}
if (Symbol.dispose) Omni.prototype[Symbol.dispose] = Omni.prototype.free;

export class PickResult {
    static __wrap(ptr) {
        const obj = Object.create(PickResult.prototype);
        obj.__wbg_ptr = ptr;
        PickResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PickResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_pickresult_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @returns {string}
     */
    get chosen() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.pickresult_chosen(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {boolean}
     */
    get handled() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.pickresult_handled(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get redraw() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.pickresult_redraw(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
}
if (Symbol.dispose) PickResult.prototype[Symbol.dispose] = PickResult.prototype.free;

export class PressOutcome {
    static __wrap(ptr) {
        const obj = Object.create(PressOutcome.prototype);
        obj.__wbg_ptr = ptr;
        PressOutcomeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PressOutcomeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_pressoutcome_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @returns {string}
     */
    get hit() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.pressoutcome_hit(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {boolean}
     */
    get redraw() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.pressoutcome_redraw(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
}
if (Symbol.dispose) PressOutcome.prototype[Symbol.dispose] = PressOutcome.prototype.free;

export class RuleStyleDeclarationStore {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RuleStyleDeclarationStoreFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_rulestyledeclarationstore_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @returns {string}
     */
    cascadeText() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.rulestyledeclarationstore_cascadeText(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {string}
     */
    cssText() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.rulestyledeclarationstore_cssText(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} name
     * @returns {string}
     */
    getPropertyPriority(name) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.rulestyledeclarationstore_getPropertyPriority(this.__wbg_ptr, ptr0, len0);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} name
     * @returns {string}
     */
    getPropertyValue(name) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.rulestyledeclarationstore_getPropertyValue(this.__wbg_ptr, ptr0, len0);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} name
     * @returns {boolean}
     */
    hasProperty(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.rulestyledeclarationstore_hasProperty(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * @param {number} index
     * @returns {string}
     */
    item(index) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.rulestyledeclarationstore_item(this.__wbg_ptr, index);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {number}
     */
    length() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.rulestyledeclarationstore_length(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {string} context
     * @param {string} css_text
     * @param {string} base_url
     */
    constructor(context, css_text, base_url) {
        const ptr0 = passStringToWasm0(context, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(css_text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.rulestyledeclarationstore_new(ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        RuleStyleDeclarationStoreFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {string} name
     * @returns {string}
     */
    removeProperty(name) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.rulestyledeclarationstore_removeProperty(this.__wbg_ptr, ptr0, len0);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} css_text
     */
    setCssText(css_text) {
        const ptr0 = passStringToWasm0(css_text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        __wbg_call_guard();
        try {
            wasm.rulestyledeclarationstore_setCssText(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @param {string} name
     * @param {string} value
     * @param {string} priority
     * @returns {boolean}
     */
    setProperty(name, value, priority) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(priority, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.rulestyledeclarationstore_setProperty(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
}
if (Symbol.dispose) RuleStyleDeclarationStore.prototype[Symbol.dispose] = RuleStyleDeclarationStore.prototype.free;

/**
 * Wasm replay interface with one session resource cache per instance.
 * Raster and PDF failures return empty bytes; diagnostics are available via `lastRasterizeInfo`.
 */
export class SceneRasterizer {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SceneRasterizerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_scenerasterizer_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * Retire an engine-store image key whose payload is no longer available.
     * Later missing-resource scans skip it; absent images paint as a no-op.
     * @param {string} key
     * @returns {number}
     */
    abandonImage(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_abandonImage(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * Apply `scene` at viewport-space `(dst_x, dst_y)` without encoding.
     * Returns `false` if `key` does not match the base or the scene cannot be replayed.
     * @param {Uint8Array} scene
     * @param {number} dst_x
     * @param {number} dst_y
     * @param {string} key
     * @returns {boolean}
     */
    blitPartial(scene, dst_x, dst_y, key) {
        const ptr0 = passArray8ToWasm0(scene, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_blitPartial(this.__wbg_ptr, ptr0, len0, dst_x, dst_y, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * Encode the retained frame, re-encoding only rows changed since its
     * last encode.
     * Returns empty bytes when `key` is not the retained base or encoding fails.
     * @param {string} format
     * @param {number} quality
     * @param {string} key
     * @returns {Uint8Array}
     */
    encodeRetained(format, quality, key) {
        const ptr0 = passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_encodeRetained(this.__wbg_ptr, ptr0, len0, quality, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * Diagnostics for the last rasterize call: JSON with the
     * error string (empty = ok) + degraded-frame counters.
     * @returns {string}
     */
    lastRasterizeInfo() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.scenerasterizer_lastRasterizeInfo(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * Scan a framed scene for resources the store can't satisfy.
     * Returns [count u32] + count × { kind u8, hash u64 (LE) }.
     * @param {Uint8Array} scene
     * @returns {Uint8Array}
     */
    missingResources(scene) {
        const ptr0 = passArray8ToWasm0(scene, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_missingResources(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * Union missingResources over every scene in a PDF envelope
     * ([count u32] then per scene [len u32][framed bytes] — see
     * DomHandle::recordPdfScenes). Same wire encoding as
     * missingResources so the manager's split/fetch loop is shared.
     * @param {Uint8Array} envelope
     * @returns {Uint8Array}
     */
    missingResourcesPdf(envelope) {
        const ptr0 = passArray8ToWasm0(envelope, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_missingResourcesPdf(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * Create a rasterizer with an empty resource store and no retained frame.
     */
    constructor() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_new();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        this.__wbg_ptr = ret;
        SceneRasterizerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * JSON array of { hash: "<u64 as decimal string>", path }
     * entries for font asset-refs awaiting putFontAsset.
     * @returns {string}
     */
    pendingFontAssets() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.scenerasterizer_pendingFontAssets(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * Engine-store image keys awaiting putImageBytes, as decimal
     * strings (a u64 doesn't survive a JS number). Format-3 refs
     * land here instead of being stored — see IMAGE_FORMAT_ENGINE_REF.
     * @returns {string[]}
     */
    pendingImages() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_pendingImages(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Register a fetched font asset file (post-fetch bytes; woff2
     * is decompressed here). `path` matches pending asset-refs —
     * see ResourceStore::put_font_asset for why path, not hash.
     * @param {string} path
     * @param {Uint8Array} bytes
     * @returns {number}
     */
    putFontAsset(path, bytes) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_putFontAsset(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * Supply the payload for one engine-store image ref. Returns 1 on
     * a successful decode, 0 for an unknown key or undecodable bytes.
     * @param {string} key
     * @param {Uint8Array} bytes
     * @returns {number}
     */
    putImageBytes(key, bytes) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_putImageBytes(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * Ingest a PageScript render_rbi_resources reply. Returns the
     * number of entries stored; asset-refs land in the pending
     * list instead (see pendingFontAssets).
     * @param {Uint8Array} batch
     * @returns {number}
     */
    putResources(batch) {
        const ptr0 = passArray8ToWasm0(batch, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_putResources(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * Rasterize a framed scene to an encoded image. Empty Vec on
     * failure — read lastError for the reason. Format string and
     * quality clamp semantics match screenshot.rs encoders.
     * @param {Uint8Array} scene
     * @param {string} format
     * @param {number} quality
     * @param {boolean} omit_background
     * @returns {Uint8Array}
     */
    rasterize(scene, format, quality, omit_background) {
        const ptr0 = passArray8ToWasm0(scene, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_rasterize(this.__wbg_ptr, ptr0, len0, ptr1, len1, quality, omit_background);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * Rasterize a full frame and retain its RGBA under `key` for later partial updates.
     * Only one base is kept per instance; oversized frames are returned but not retained.
     * @param {Uint8Array} scene
     * @param {string} format
     * @param {number} quality
     * @param {boolean} omit_background
     * @param {string} key
     * @returns {Uint8Array}
     */
    rasterizeAndRetain(scene, format, quality, omit_background, key) {
        const ptr0 = passArray8ToWasm0(scene, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_rasterizeAndRetain(this.__wbg_ptr, ptr0, len0, ptr1, len1, quality, omit_background, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v4;
    }
    /**
     * Composite a damage-rect scene at viewport-space `(dst_x, dst_y)` and encode the full frame.
     * Requires a retained frame with the same `key`.
     * Failures return empty bytes and set `lastRasterizeInfo`.
     * @param {Uint8Array} scene
     * @param {number} dst_x
     * @param {number} dst_y
     * @param {string} format
     * @param {number} quality
     * @param {string} key
     * @returns {Uint8Array}
     */
    rasterizePartial(scene, dst_x, dst_y, format, quality, key) {
        const ptr0 = passArray8ToWasm0(scene, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_rasterizePartial(this.__wbg_ptr, ptr0, len0, dst_x, dst_y, ptr1, len1, quality, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v4;
    }
    /**
     * Replay a `recordPdfScenes` envelope into a Krilla document, one scene per page.
     * Pages use a point-sized MediaBox, px-to-pt scale, and optional white fill.
     * Margins and `render_h` set paint bounds. Failures return empty bytes; read
     * `lastRasterizeInfo` for diagnostics.
     * @param {Uint8Array} envelope
     * @param {number} paper_width
     * @param {number} paper_height
     * @param {boolean} omit_background
     * @param {number} margin_top
     * @param {number} margin_right
     * @param {number} margin_bottom
     * @param {number} margin_left
     * @returns {Uint8Array}
     */
    renderPdf(envelope, paper_width, paper_height, omit_background, margin_top, margin_right, margin_bottom, margin_left) {
        const ptr0 = passArray8ToWasm0(envelope, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_renderPdf(this.__wbg_ptr, ptr0, len0, paper_width, paper_height, omit_background, margin_top, margin_right, margin_bottom, margin_left);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * Reserve scratch-buffer capacity for a `w`-by-`h` frame before rasterizing.
     * This does not create or replace a retained frame.
     * @param {number} w
     * @param {number} h
     */
    reserveFrame(w, h) {
        __wbg_call_guard();
        try {
            wasm.scenerasterizer_reserveFrame(this.__wbg_ptr, w, h);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * Drop every cached font and image. Batch entries are stored under the hash the page
     * reports, so the host calls this when the document that supplies them changes.
     */
    resetResources() {
        __wbg_call_guard();
        try {
            wasm.scenerasterizer_resetResources(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * Key of the currently retained base frame ("" = none). The JS
     * side gates its baseSeq handshake on this before opting in.
     * @returns {string}
     */
    retainedFrameKey() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.scenerasterizer_retainedFrameKey(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * Move the retained frame's pixels by (dx, dy) for a page scroll,
     * without encoding. The caller patches the exposed band with
     * `blitPartial`, then ships the frame with `encodeRetained`.
     * Returns `false` when `key` does not identify the retained frame.
     * @param {string} key
     * @param {number} dx
     * @param {number} dy
     * @returns {boolean}
     */
    shiftRetained(key, dx, dy) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.scenerasterizer_shiftRetained(this.__wbg_ptr, ptr0, len0, dx, dy);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
}
if (Symbol.dispose) SceneRasterizer.prototype[Symbol.dispose] = SceneRasterizer.prototype.free;

export class TtyRenderer {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TtyRendererFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_ttyrenderer_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @param {string} key
     * @returns {number}
     */
    abandonImage(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_abandonImage(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    cellCollisions() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_cellCollisions(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    imagesMissing() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_imagesMissing(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    imagesPlaced() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_imagesPlaced(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {Uint8Array} scene
     * @returns {Uint8Array}
     */
    missingImages(scene) {
        const ptr0 = passArray8ToWasm0(scene, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_missingImages(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    constructor() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_new();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        this.__wbg_ptr = ret;
        TtyRendererFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string[]}
     */
    pendingImages() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_pendingImages(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {number}
     */
    placementCount() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_placementCount(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    placementMeta() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.ttyrenderer_placementMeta(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {number} i
     * @returns {Uint8Array}
     */
    placementPng(i) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_placementPng(this.__wbg_ptr, i);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {string} key
     * @param {Uint8Array} bytes
     * @returns {number}
     */
    putImageBytes(key, bytes) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_putImageBytes(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {Uint8Array} batch
     * @returns {number}
     */
    putResources(batch) {
        const ptr0 = passArray8ToWasm0(batch, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ttyrenderer_putResources(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @param {Uint8Array} scene
     * @param {number} cols
     * @param {number} rows
     * @param {number} cell_w
     * @param {number} cell_h
     * @returns {string}
     */
    sceneToAnsi(scene, cols, rows, cell_w, cell_h) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passArray8ToWasm0(scene, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.ttyrenderer_sceneToAnsi(this.__wbg_ptr, ptr0, len0, cols, rows, cell_w, cell_h);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @param {string} mode
     */
    setImageMode(mode) {
        const ptr0 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        __wbg_call_guard();
        try {
            wasm.ttyrenderer_setImageMode(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}
if (Symbol.dispose) TtyRenderer.prototype[Symbol.dispose] = TtyRenderer.prototype.free;

/**
 * @param {Uint8Array} buf
 * @returns {string}
 */
export function decodeTermInput(buf) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passArray8ToWasm0(buf, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.decodeTermInput(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * JS-callable: flip Lazy→Full once every recorded face has been
 * swapped, so later lazy registrations fetch full files directly.
 * @returns {boolean}
 */
export function finishFontUpgrade() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.finishFontUpgrade();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * Return each registered family and its face attributes as JSON.
 * @returns {string}
 */
export function font_families_json() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.font_families_json();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @returns {string}
 */
export function ks_boa_force_collect() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_boa_force_collect();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {any} v
 * @returns {any}
 */
export function ks_bridge_buffer_bytes(v) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_bridge_buffer_bytes(v);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * @returns {boolean}
 */
export function ks_bridge_ever_minted() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_bridge_ever_minted();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * @param {Function} data
 * @param {Function} accessor
 */
export function ks_bridge_install_desc_helpers(data, accessor) {
    __wbg_call_guard();
    try {
        wasm.ks_bridge_install_desc_helpers(data, accessor);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @returns {string}
 */
export function ks_bridge_pins() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_bridge_pins();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {string} fn_src
 * @param {any} this_v8
 * @param {Array<any>} args_v8
 * @param {boolean} await_promise
 * @param {boolean} return_by_value
 * @returns {Promise<any>}
 */
export function ks_call_cdp(fn_src, this_v8, args_v8, await_promise, return_by_value) {
    const ptr0 = passStringToWasm0(fn_src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_call_cdp(ptr0, len0, this_v8, args_v8, await_promise, return_by_value);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * @param {string} prelude
 * @returns {string | undefined}
 */
export function ks_canonicalize_page_selectors(prelude) {
    const ptr0 = passStringToWasm0(prelude, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_canonicalize_page_selectors(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    let v2;
    if (ret[0] !== 0) {
        v2 = getStringFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
}

/**
 * What compiled code retains, by form: the counters boa keeps behind the code store. Pairs
 * are already camelCase, so they land in `bridge.boaCode` as they are.
 * @returns {string}
 */
export function ks_code_stats() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_code_stats();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {string} css
 * @param {string} field
 * @param {string} value
 * @returns {any}
 */
export function ks_counter_style_rule(css, field, value) {
    const ptr0 = passStringToWasm0(css, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(field, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_counter_style_rule(ptr0, len0, ptr1, len1, ptr2, len2);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Runs one epoch of the cross-heap cycle collector and returns its wall time in ms. With
 * `idle_skip`, an epoch whose inputs are unchanged is skipped and returns 0.
 * @param {boolean} idle_skip
 * @returns {number}
 */
export function ks_cycle_collect(idle_skip) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_cycle_collect(idle_skip);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * @returns {string}
 */
export function ks_cycle_stats() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_cycle_stats();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {string} encoding
 * @param {string} input
 * @returns {Uint8Array}
 */
export function ks_encode_html(encoding, input) {
    const ptr0 = passStringToWasm0(encoding, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_encode_html(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * @param {string} label
 * @returns {string | undefined}
 */
export function ks_encoding_name(label) {
    const ptr0 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_encoding_name(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    let v2;
    if (ret[0] !== 0) {
        v2 = getStringFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
}

/**
 * @param {string} src
 * @param {boolean} await_promise
 * @returns {Promise<any>}
 */
export function ks_eval(src, await_promise) {
    const ptr0 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_eval(ptr0, len0, await_promise);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * @param {string} src
 * @param {boolean} await_promise
 * @param {boolean} return_by_value
 * @returns {Promise<any>}
 */
export function ks_eval_cdp(src, await_promise, return_by_value) {
    const ptr0 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_eval_cdp(ptr0, len0, await_promise, return_by_value);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * @param {string} src
 * @returns {any}
 */
export function ks_eval_page(src) {
    const ptr0 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_eval_page(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} src
 * @returns {string}
 */
export function ks_eval_sync(src) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_eval_sync(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {string} css
 * @param {string} property
 * @returns {string}
 */
export function ks_get_property_value(css, property) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(css, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(property, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_get_property_value(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {string} specifier
 * @param {string} referrer_url
 * @param {string | null} [module_type]
 * @returns {Promise<any>}
 */
export function ks_import(specifier, referrer_url, module_type) {
    const ptr0 = passStringToWasm0(specifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(referrer_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(module_type) ? 0 : passStringToWasm0(module_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_import(ptr0, len0, ptr1, len1, ptr2, len2);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * @param {any} v
 * @returns {boolean}
 */
export function ks_is_bridged(v) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_is_bridged(v);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * @param {string} op
 * @param {number} bytes
 * @param {string} detail
 * @returns {number}
 */
export function ks_js_span_enter(op, bytes, detail) {
    const ptr0 = passStringToWasm0(op, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(detail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_js_span_enter(ptr0, len0, bytes, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret >>> 0;
}

/**
 * @param {number} slot
 */
export function ks_js_span_exit(slot) {
    __wbg_call_guard();
    try {
        wasm.ks_js_span_exit(slot);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {string} css
 * @returns {any}
 */
export function ks_parse_inline_style(css) {
    const ptr0 = passStringToWasm0(css, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_parse_inline_style(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} css
 * @returns {string}
 */
export function ks_parse_stylesheet(css) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(css, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_parse_stylesheet(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {string} css
 * @returns {any}
 */
export function ks_parse_stylesheet_structured(css) {
    const ptr0 = passStringToWasm0(css, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_parse_stylesheet_structured(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} css_text
 * @returns {any}
 */
export function ks_parse_typed_numeric_value(css_text) {
    const ptr0 = passStringToWasm0(css_text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_parse_typed_numeric_value(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} property
 * @param {string} css_text
 * @returns {any}
 */
export function ks_parse_typed_style_value(property, css_text) {
    const ptr0 = passStringToWasm0(property, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(css_text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_parse_typed_style_value(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} encoding
 * @param {string} input
 * @param {number} set
 * @param {boolean} space_as_plus
 * @returns {string}
 */
export function ks_percent_encode_after_encoding(encoding, input, set, space_as_plus) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(encoding, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_percent_encode_after_encoding(ptr0, len0, ptr1, len1, set, space_as_plus);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Render HTML to PNG, JPEG, or WebP; unknown formats and RGBA fall back to PNG.
 * Quality is clamped to 1 to 100 and applies only to JPEG. HTTP resources are
 * not fetched, so callers must inline their stylesheets and external images.
 * An unusable base URL uses `https://kitesurf.local/`; failures return empty bytes.
 * @param {string} html
 * @param {string} base_url
 * @param {number} width
 * @param {number} height
 * @param {string} format
 * @param {number} quality
 * @returns {Uint8Array}
 */
export function ks_render_html_to_image(html, base_url, width, height, format, quality) {
    const ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_render_html_to_image(ptr0, len0, ptr1, len1, width, height, ptr2, len2, quality);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Compatibility export for callers that only need PNG output.
 * @param {string} html
 * @param {string} base_url
 * @param {number} width
 * @param {number} height
 * @returns {Uint8Array}
 */
export function ks_render_html_to_png(html, base_url, width, height) {
    const ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_render_html_to_png(ptr0, len0, ptr1, len1, width, height);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

export function ks_run_page_jobs() {
    __wbg_call_guard();
    try {
        wasm.ks_run_page_jobs();
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {string} html
 * @returns {string}
 */
export function ks_scan_document(html) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_scan_document(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {string} css
 * @returns {string}
 */
export function ks_serialize_inline_style(css) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(css, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_serialize_inline_style(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {boolean} v
 */
export function ks_set_boa_strict(v) {
    __wbg_call_guard();
    try {
        wasm.ks_set_boa_strict(v);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {number} min_bytes
 * @param {Function | null} [put]
 * @param {Function | null} [read]
 * @param {Function | null} [release]
 * @param {Function | null} [flush]
 */
export function ks_set_code_store(min_bytes, put, read, release, flush) {
    __wbg_call_guard();
    try {
        wasm.ks_set_code_store(min_bytes, isLikeNone(put) ? 0 : addToExternrefTable0(put), isLikeNone(read) ? 0 : addToExternrefTable0(read), isLikeNone(release) ? 0 : addToExternrefTable0(release), isLikeNone(flush) ? 0 : addToExternrefTable0(flush));
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {Function | null} [f]
 */
export function ks_set_emit_hook(f) {
    __wbg_call_guard();
    try {
        wasm.ks_set_emit_hook(isLikeNone(f) ? 0 : addToExternrefTable0(f));
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {number} bytes
 */
export function ks_set_swap_budget(bytes) {
    __wbg_call_guard();
    try {
        wasm.ks_set_swap_budget(bytes);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {Promise<any>} promise
 * @returns {Promise<any>}
 */
export function ks_spike_await(promise) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_spike_await(promise);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * @param {Promise<any>} js_promise
 * @returns {Promise<any>}
 */
export function ks_spike_boa_await(js_promise) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.ks_spike_boa_await(js_promise);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * @returns {string}
 */
export function ks_stylo_smoke() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_stylo_smoke();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * What the counting allocator has seen: live bytes, the swap budget and the rounds it forced.
 * Reported beside the bridge's gauges, since a page's wasm memory is what the swap acts on.
 * @returns {string}
 */
export function ks_swap_alloc_stats() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_swap_alloc_stats();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @returns {string}
 */
export function ks_ua_stylesheet() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_ua_stylesheet();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {string} selector
 * @returns {string}
 */
export function ks_validate_selector(selector) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.ks_validate_selector(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Return the registered mono advance per em, or zero when unavailable.
 * @returns {number}
 */
export function monoAdvancePerEm() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.monoAdvancePerEm();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function osc52(text) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.osc52(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * JS-callable: asset paths awaiting the full-file swap, in
 * registration order. Empty array outside Lazy mode.
 * @returns {string[]}
 */
export function pendingLazyFontPaths() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.pendingLazyFontPaths();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * Register Noto Sans CJK SC for Han, Hiragana, Katakana, and Hangul fallbacks.
 * Regional aliases, including Simplified Chinese variants, share one blob.
 * Add it after emoji in Common for ideographic spaces and fullwidth punctuation.
 * Returns true only on the first registration.
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
export function register_cjk_font(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.register_cjk_font(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * Register fetched WOFF2 or raw OpenType emoji bytes in the shared context.
 * Aliases share one Blob and join Common fallback, so CSS need not name an
 * emoji family.
 * Returns true on the first call and false thereafter.
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
export function register_emoji_font(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.register_emoji_font(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * Register a fetched Noto face in its script fallback chain. Idempotent per tag.
 * Empty bytes or non-four-byte tags return false. Unknown tags also return false
 * because the renderer needs a matching asset path.
 * @param {Uint8Array} bytes
 * @param {string} script_tag
 * @returns {boolean}
 */
export function register_script_font(bytes, script_tag) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(script_tag, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.register_script_font(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * Lazily register symbol fallback faces. Symbols bytes are required; Symbols 2
 * is optional. Later calls return false.
 * @param {Uint8Array} symbols_bytes
 * @param {Uint8Array} symbols2_bytes
 * @returns {boolean}
 */
export function register_symbol_fonts(symbols_bytes, symbols2_bytes) {
    const ptr0 = passArray8ToWasm0(symbols_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(symbols2_bytes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.register_symbol_fonts(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * Register UA fonts before constructing a DomHandle. Sans and italic are
 * required; serif and mono are optional. Missing required bytes or duplicate
 * calls return false. Empty mono leaves the generic on its sans fallback.
 * @param {Uint8Array} sans_bytes
 * @param {Uint8Array} sans_italic_bytes
 * @param {Uint8Array} serif_bytes
 * @param {Uint8Array} mono_bytes
 * @returns {boolean}
 */
export function register_ua_fonts(sans_bytes, sans_italic_bytes, serif_bytes, mono_bytes) {
    const ptr0 = passArray8ToWasm0(sans_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(sans_italic_bytes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(serif_bytes, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray8ToWasm0(mono_bytes, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.register_ua_fonts(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * @param {Uint8Array} scene
 * @param {number} cols
 * @param {number} rows
 * @param {number} cell_w
 * @param {number} cell_h
 * @returns {string}
 */
export function sceneToAnsi(scene, cols, rows, cell_w, cell_h) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passArray8ToWasm0(scene, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.sceneToAnsi(ptr0, len0, cols, rows, cell_w, cell_h);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {boolean} dark
 */
export function setDarkColorScheme(dark) {
    __wbg_call_guard();
    try {
        wasm.setDarkColorScheme(dark);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {boolean} enabled
 */
export function setDimsOnlyImages(enabled) {
    __wbg_call_guard();
    try {
        wasm.setDimsOnlyImages(enabled);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * Lazy paint sessions: shaping-only faces until the first in-isolate
 * outline consumer (canvas text, svg <text>, printToPDF) upgrades.
 * @param {boolean} enabled
 */
export function setFontShapingLazy(enabled) {
    __wbg_call_guard();
    try {
        wasm.setFontShapingLazy(enabled);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * Pixel-free sessions: no pixel ever leaves the connection, so
 * glyph outlines are dead weight. Distinct from renderer_mode().
 * @param {boolean} enabled
 */
export function setPixelFreeSession(enabled) {
    __wbg_call_guard();
    try {
        wasm.setPixelFreeSession(enabled);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {number} w
 * @param {number} h
 */
export function setTtyCellGrid(w, h) {
    __wbg_call_guard();
    try {
        wasm.setTtyCellGrid(w, h);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {string} css
 */
export function setTtyUaCss(css) {
    const ptr0 = passStringToWasm0(css, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    __wbg_call_guard();
    try {
        wasm.setTtyUaCss(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {string} span_id_hex
 */
export function set_ks_trace_parent(span_id_hex) {
    const ptr0 = passStringToWasm0(span_id_hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    __wbg_call_guard();
    try {
        wasm.set_ks_trace_parent(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {boolean} enabled
 */
export function set_ks_tracing(enabled) {
    __wbg_call_guard();
    try {
        wasm.set_ks_tracing(enabled);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

export function start() {
    __wbg_call_guard();
    try {
        wasm.start();
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * @param {Uint8Array} bytes
 * @returns {Uint8Array | undefined}
 */
export function stripFontForShaping(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.stripFontForShaping(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    let v2;
    if (ret[0] !== 0) {
        v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
}

/**
 * JS-callable: swap one author face set to its full file (custody
 * or re-fetched bytes). Decompresses the woff container, then
 * unregister + re-register under the SAME family name/attrs so the
 * FamilyId — and every style rule resolving it — survives.
 * @param {string} url
 * @param {Uint8Array} full_bytes
 * @returns {boolean}
 */
export function upgradeAuthorFontFace(url, full_bytes) {
    const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(full_bytes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.upgradeAuthorFontFace(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * JS-callable: swap one recorded face to its full file. Returns
 * true when the swap happened (see upgrade_recorded_face).
 * @param {string} path
 * @param {Uint8Array} full_bytes
 * @returns {boolean}
 */
export function upgradeFontFace(path, full_bytes) {
    const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(full_bytes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.upgradeFontFace(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_408e67f47ca7b58b: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_String_8564e559799eccda: function(arg0, arg1) {
            const ret = String(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_boolean_get_c9c83ebd41b34df3: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_a57024b9c6e4a48b: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_falsy_b7464e97ddc1b7a4: function(arg0) {
            const ret = !arg0;
            return ret;
        },
        __wbg___wbindgen_is_function_5e4570eb24ffa122: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_null_7d13f41e1a2d5140: function(arg0) {
            const ret = arg0 === null;
            return ret;
        },
        __wbg___wbindgen_is_object_a2790eb24c211ea0: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_string_e6f02f0ea5f20a32: function(arg0) {
            const ret = typeof(arg0) === 'string';
            return ret;
        },
        __wbg___wbindgen_is_symbol_33218408cb76caac: function(arg0) {
            const ret = typeof(arg0) === 'symbol';
            return ret;
        },
        __wbg___wbindgen_is_undefined_6cff064c44e0d823: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_loose_eq_acf2776254a8d832: function(arg0, arg1) {
            const ret = arg0 == arg1;
            return ret;
        },
        __wbg___wbindgen_number_get_136b9679cab35cfb: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_panic_error_f153dd2564290663: function(arg0) {
            const ret = new PanicError(arg0);
            return ret;
        },
        __wbg___wbindgen_rethrow_fbd2dcd7d2b9ac5f: function(arg0) {
            throw new WebAssembly.Exception(__wbindgen_wrapped_jstag, [arg0]);
        },
        __wbg___wbindgen_string_get_d154f1e671052120: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_bb96b2010945f0bc: function(arg0, arg1) {
            throw new WebAssembly.Exception(__wbindgen_wrapped_jstag, [new Error(getStringFromWasm0(arg0, arg1))]);
        },
        __wbg__wbg_cb_unref_be22cc64ae6946a0: function(arg0) {
            arg0._wbg_cb_unref();
        },
        __wbg_add_2b945856b580d5ab: function(arg0, arg1) {
            const ret = arg0.add(arg1);
            return ret;
        },
        __wbg_apply_6cd9daeacef161ce: function(arg0, arg1, arg2) {
            const ret = Reflect.apply(arg0, arg1, arg2);
            return ret;
        },
        __wbg_assign_c045318ddcb8e589: function(arg0, arg1) {
            const ret = Object.assign(arg0, arg1);
            return ret;
        },
        __wbg_asyncIterator_6a2c651f755e0440: function() {
            const ret = Symbol.asyncIterator;
            return ret;
        },
        __wbg_call_0f2a9af232c18fd2: function(arg0, arg1, arg2, arg3) {
            const ret = arg0.call(arg1, arg2, arg3);
            return ret;
        },
        __wbg_call_1c5886ab9c57d1c7: function(arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        },
        __wbg_call_35dba3c747ad7521: function(arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        },
        __wbg_call_39f824e18d9d2414: function(arg0, arg1, arg2, arg3, arg4) {
            const ret = arg0.call(arg1, arg2, arg3, arg4);
            return ret;
        },
        __wbg_construct_987cb41ef1a5c273: function(arg0, arg1, arg2) {
            const ret = Reflect.construct(arg0, arg1, arg2);
            return ret;
        },
        __wbg_construct_a5c4a12c650f2c30: function(arg0, arg1) {
            const ret = Reflect.construct(arg0, arg1);
            return ret;
        },
        __wbg_crypto_38df2bab126b63dc: function(arg0) {
            const ret = arg0.crypto;
            return ret;
        },
        __wbg_defineProperty_c42c661b4dea36ef: function(arg0, arg1, arg2) {
            const ret = Object.defineProperty(arg0, arg1, arg2);
            return ret;
        },
        __wbg_defineProperty_fd52ca8062acf9a6: function(arg0, arg1, arg2) {
            const ret = Reflect.defineProperty(arg0, arg1, arg2);
            return ret;
        },
        __wbg_deleteProperty_83dd9487ca70fb9c: function(arg0, arg1) {
            const ret = Reflect.deleteProperty(arg0, arg1);
            return ret;
        },
        __wbg_done_669171204c3dcae2: function(arg0) {
            const ret = arg0.done;
            return ret;
        },
        __wbg_entries_7774d489e1da5f4f: function(arg0) {
            const ret = Object.entries(arg0);
            return ret;
        },
        __wbg_error_3a1a8afe82827389: function(arg0, arg1) {
            console.error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_error_757e9472f8410341: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                __wbg_call_guard();
                try {
                    wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                } catch(e) {
                    __wbg_handle_catch(e);
                }
            }
        },
        __wbg_fetchResource_da5fd5de932aeeb6: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            (__bridgeFetchResource ? __bridgeFetchResource : (() => {}))( arg0 >>> 0, getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4), getStringFromWasm0(arg5, arg6));
        },
        __wbg_for_6cd11b27e33e4d0b: function(arg0, arg1) {
            const ret = Symbol.for(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_getOwnPropertyDescriptor_29060a1705edd8fd: function(arg0, arg1) {
            const ret = Reflect.getOwnPropertyDescriptor(arg0, arg1);
            return ret;
        },
        __wbg_getOwnPropertyNames_8d4152f1f382b15c: function(arg0) {
            const ret = Object.getOwnPropertyNames(arg0);
            return ret;
        },
        __wbg_getOwnPropertySymbols_601ddcf07da75d00: function(arg0) {
            const ret = Object.getOwnPropertySymbols(arg0);
            return ret;
        },
        __wbg_getPrototypeOf_55a24d07487f0509: function(arg0) {
            const ret = Reflect.getPrototypeOf(arg0);
            return ret;
        },
        __wbg_getRandomValues_436a51d0629d84e1: function(arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        },
        __wbg_getRandomValues_a608c4436c19407a: function(arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        },
        __wbg_getRandomValues_c44a50d8cfdaebeb: function(arg0, arg1) {
            arg0.getRandomValues(arg1);
        },
        __wbg_getTime_63fb0332e6c4ec17: function(arg0) {
            const ret = arg0.getTime();
            return ret;
        },
        __wbg_getTimezoneOffset_4baa793e0d3962a8: function(arg0) {
            const ret = arg0.getTimezoneOffset();
            return ret;
        },
        __wbg_get_2b6f729479cf48bd: function(arg0, arg1) {
            const ret = arg0.get(arg1);
            return ret;
        },
        __wbg_get_40c339df148585d9: function(arg0, arg1) {
            const ret = arg0.get(arg1);
            return ret;
        },
        __wbg_get_971a0c45d172643f: function(arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        },
        __wbg_get_c0c8f8d7da0c03dd: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_d173c0308df22d37: function(arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        },
        __wbg_get_fd448b519a4491b5: function(arg0, arg1, arg2) {
            const ret = Reflect.get(arg0, arg1, arg2);
            return ret;
        },
        __wbg_get_unchecked_e20b893aeafc3fca: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_hasInstance_12d9474a81347156: function() {
            const ret = Symbol.hasInstance;
            return ret;
        },
        __wbg_has_663db15056993a2d: function(arg0, arg1) {
            const ret = arg0.has(arg1);
            return ret;
        },
        __wbg_has_7242c1bba6946496: function(arg0, arg1) {
            const ret = arg0.has(arg1);
            return ret;
        },
        __wbg_has_b3a6e6d0d28295fa: function(arg0, arg1) {
            const ret = Reflect.has(arg0, arg1);
            return ret;
        },
        __wbg_includes_a4b83ade703cb80b: function(arg0, arg1, arg2) {
            const ret = arg0.includes(arg1, arg2);
            return ret;
        },
        __wbg_instanceof_ArrayBuffer_993d02d2d254cad1: function(arg0) {
            let result;
            try {
                result = arg0 instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Object_80ad464782e2bd73: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Object;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Promise_e6e764b945c3128a: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Promise;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Uint8Array_f935dbb0aa7cdeed: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_isArray_6339f732981044bf: function(arg0) {
            const ret = Array.isArray(arg0);
            return ret;
        },
        __wbg_isConcatSpreadable_bfbcd872ef087518: function() {
            const ret = Symbol.isConcatSpreadable;
            return ret;
        },
        __wbg_isExtensible_1213b80e9809c1fd: function(arg0) {
            const ret = Reflect.isExtensible(arg0);
            return ret;
        },
        __wbg_is_86be747e88e872fb: function(arg0, arg1) {
            const ret = Object.is(arg0, arg1);
            return ret;
        },
        __wbg_iterator_5cebbb86e33c6dd6: function() {
            const ret = Symbol.iterator;
            return ret;
        },
        __wbg_keyFor_9c8ac6ea780cc107: function(arg0) {
            const ret = Symbol.keyFor(arg0);
            return ret;
        },
        __wbg_length_36bd29c6848c2144: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_ecfa2c63d3d0d82c: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_log_727ea84e760fa01a: function(arg0, arg1) {
            console.log(getStringFromWasm0(arg0, arg1));
        },
        __wbg_match_2e1722ae1ba200cf: function() {
            const ret = Symbol.match;
            return ret;
        },
        __wbg_msCrypto_bd5a034af96bcba6: function(arg0) {
            const ret = arg0.msCrypto;
            return ret;
        },
        __wbg_new_0_f117d868b403dc07: function() {
            const ret = new Date();
            return ret;
        },
        __wbg_new_116be93542d39019: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_new_358857d90afd5a2d: function(arg0, arg1) {
            const ret = new Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_418fb92a013d5930: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return wasm_bindgen_850068d9710d5473___convert__closures_____invoke___js_sys_a6174709d61e686f___Function_fn_wasm_bindgen_850068d9710d5473___JsValue_____wasm_bindgen_850068d9710d5473___sys__Undefined___js_sys_a6174709d61e686f___Function_fn_wasm_bindgen_850068d9710d5473___JsValue_____wasm_bindgen_850068d9710d5473___sys__Undefined_______true_(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = 0;
            }
        },
        __wbg_new_77cc4f4f472aeb81: function(arg0) {
            const ret = new Uint8Array(arg0);
            return ret;
        },
        __wbg_new_c337a13be8e38742: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_new_cdf041679ded4c5f: function() {
            const ret = new Map();
            return ret;
        },
        __wbg_new_d29ccbc1854174b3: function(arg0) {
            const ret = new Set(arg0);
            return ret;
        },
        __wbg_new_d7e3a9c0bf7c1dc9: function() {
            const ret = new WeakMap();
            return ret;
        },
        __wbg_new_d90fda6c0dfb2783: function(arg0, arg1) {
            const ret = new Proxy(arg0, arg1);
            return ret;
        },
        __wbg_new_ebe3e0f6837f0879: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_f9d6489212f3b2b3: function(arg0) {
            const ret = new Date(arg0);
            return ret;
        },
        __wbg_new_from_slice_3eea173078478cfe: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_with_length_3ffc1c56427c525c: function(arg0) {
            const ret = new Uint8Array(arg0 >>> 0);
            return ret;
        },
        __wbg_next_42cf16ee0dafc9e2: function(arg0) {
            const ret = arg0.next();
            return ret;
        },
        __wbg_next_8f26b64fa5e9f64b: function(arg0) {
            const ret = arg0.next;
            return ret;
        },
        __wbg_node_84ea875411254db1: function(arg0) {
            const ret = arg0.node;
            return ret;
        },
        __wbg_now_8b265300afd5f2b9: function() {
            const ret = Date.now();
            return ret;
        },
        __wbg_now_e7c6795a7f81e10f: function(arg0) {
            const ret = arg0.now();
            return ret;
        },
        __wbg_of_0c6464fa8d2aa86d: function(arg0) {
            const ret = Array.of(arg0);
            return ret;
        },
        __wbg_of_598c0ff0cd48a890: function(arg0, arg1) {
            const ret = Array.of(arg0, arg1);
            return ret;
        },
        __wbg_ownKeys_49880e0197268893: function(arg0) {
            const ret = Reflect.ownKeys(arg0);
            return ret;
        },
        __wbg_performance_3fcf6e32a7e1ed0a: function(arg0) {
            const ret = arg0.performance;
            return ret;
        },
        __wbg_preventExtensions_d9a35633343654e5: function(arg0) {
            const ret = Reflect.preventExtensions(arg0);
            return ret;
        },
        __wbg_process_44c7a14e11e9f69e: function(arg0) {
            const ret = arg0.process;
            return ret;
        },
        __wbg_prototypesetcall_de8e0d9553586985: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_push_adb0107829f02d75: function(arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        },
        __wbg_queueMicrotask_ac694eae12e92dfb: function(arg0) {
            queueMicrotask(arg0);
        },
        __wbg_queueMicrotask_be5fe34a8f4cad4d: function(arg0) {
            const ret = arg0.queueMicrotask;
            return ret;
        },
        __wbg_randomFillSync_6c25eac9869eb53c: function(arg0, arg1) {
            arg0.randomFillSync(arg1);
        },
        __wbg_replace_b50ac2dcc88b95a1: function() {
            const ret = Symbol.replace;
            return ret;
        },
        __wbg_require_b4edbdcf3e2a1ef0: function() {
            const ret = module.require;
            return ret;
        },
        __wbg_resolve_020f95d838c6ef25: function(arg0) {
            const ret = Promise.resolve(arg0);
            return ret;
        },
        __wbg_search_e900b362aded072e: function() {
            const ret = Symbol.search;
            return ret;
        },
        __wbg_setPrototypeOf_aa01adb90e6d8845: function(arg0, arg1) {
            const ret = Reflect.setPrototypeOf(arg0, arg1);
            return ret;
        },
        __wbg_set_014226dfeca53178: function(arg0, arg1, arg2) {
            const ret = arg0.set(arg1, arg2);
            return ret;
        },
        __wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
            arg0[arg1] = arg2;
        },
        __wbg_set_8155bb79a948541b: function(arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        },
        __wbg_set_a80955eb93b145c6: function(arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbg_set_a829e7cf1d3e92fd: function(arg0, arg1, arg2) {
            const ret = arg0.set(arg1, arg2);
            return ret;
        },
        __wbg_set_fda5ce129fb0934e: function(arg0, arg1, arg2, arg3) {
            const ret = Reflect.set(arg0, arg1, arg2, arg3);
            return ret;
        },
        __wbg_slice_6438d3c2b2847d98: function(arg0, arg1) {
            const ret = arg1.slice();
            const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_species_40b8ab53e61440d8: function() {
            const ret = Symbol.species;
            return ret;
        },
        __wbg_split_6ca297931a3ba724: function() {
            const ret = Symbol.split;
            return ret;
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_stack_afa1c20f6ed0b2b6: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_static_accessor_GLOBAL_THIS_466428f93b4eaa76: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_c7aea38d4de089bc: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_42d4fae05e59267a: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_e0db14a0eba6a812: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_subarray_a4cc58201c7359fd: function(arg0, arg1, arg2) {
            const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_then_7026b513a94278a8: function(arg0, arg1) {
            const ret = arg0.then(arg1);
            return ret;
        },
        __wbg_then_72819b8d4e081fb5: function(arg0, arg1, arg2) {
            const ret = arg0.then(arg1, arg2);
            return ret;
        },
        __wbg_toPrimitive_b43a439791f39637: function() {
            const ret = Symbol.toPrimitive;
            return ret;
        },
        __wbg_toStringTag_d4af14370852d490: function() {
            const ret = Symbol.toStringTag;
            return ret;
        },
        __wbg_unscopables_7d8fb811e111e8d8: function() {
            const ret = Symbol.unscopables;
            return ret;
        },
        __wbg_value_1e2369fab29b420e: function(arg0) {
            const ret = arg0.value;
            return ret;
        },
        __wbg_versions_276b2795b1c6a219: function(arg0) {
            const ret = arg0.versions;
            return ret;
        },
        __wbg_warn_b59f6959f1bc375c: function(arg0, arg1) {
            console.warn(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref, Externref, Externref, Externref], shim_idx: 89, ret: Externref, inner_ret: Some(Externref) }, mutable: false }) -> Externref`.
            const ret = makeClosure(arg0, arg1, wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_);
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref, Externref, Externref], shim_idx: 91, ret: Externref, inner_ret: Some(Externref) }, mutable: false }) -> Externref`.
            const ret = makeClosure(arg0, arg1, wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_);
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref, Externref], shim_idx: 93, ret: Externref, inner_ret: Some(Externref) }, mutable: false }) -> Externref`.
            const ret = makeClosure(arg0, arg1, wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_);
            return ret;
        },
        __wbindgen_cast_0000000000000004: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 103, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue______true_);
            return ret;
        },
        __wbindgen_cast_0000000000000005: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 5269, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_____wasm_bindgen_850068d9710d5473___JsError___true_);
            return ret;
        },
        __wbindgen_cast_0000000000000006: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 95, ret: Externref, inner_ret: Some(Externref) }, mutable: false }) -> Externref`.
            const ret = makeClosure(arg0, arg1, wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_);
            return ret;
        },
        __wbindgen_cast_0000000000000007: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [F64, Externref, Externref], shim_idx: 97, ret: Result(Externref), inner_ret: Some(Result(Externref)) }, mutable: false }) -> Externref`.
            const ret = makeClosure(arg0, arg1, wasm_bindgen_850068d9710d5473___convert__closures_____invoke___f64__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue___true_);
            return ret;
        },
        __wbindgen_cast_0000000000000008: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [F64, Externref], shim_idx: 99, ret: Result(Externref), inner_ret: Some(Result(Externref)) }, mutable: false }) -> Externref`.
            const ret = makeClosure(arg0, arg1, wasm_bindgen_850068d9710d5473___convert__closures_____invoke___f64__wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue___true_);
            return ret;
        },
        __wbindgen_cast_0000000000000009: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [F64, F64, Externref], shim_idx: 101, ret: Result(Externref), inner_ret: Some(Result(Externref)) }, mutable: false }) -> Externref`.
            const ret = makeClosure(arg0, arg1, wasm_bindgen_850068d9710d5473___convert__closures_____invoke___f64__f64__wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue___true_);
            return ret;
        },
        __wbindgen_cast_000000000000000a: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_000000000000000b: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
            const ret = getArrayU8FromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_000000000000000c: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
        __wbindgen_jstag: WebAssembly.JSTag,
        __wbindgen_wrapped_jstag: __wbindgen_wrapped_jstag,
    };
    return {
        __proto__: null,
        "./kitesurf_core_bg.js": import0,
    };
}

const __wbindgen_wrapped_jstag = new WebAssembly.Tag({ parameters: ['externref'] });


let __wbg_terminated_addr;
let __wbg_called_abort = false;
function __wbg_call_abort_hook() {
    __wbg_called_abort = true;
    try {
        const idx = getInt32ArrayMemory0()[wasm.__abort_handler.value / 4];
        if (idx) wasm.__wbindgen_export.get(idx)();
    } catch(_) {}
}

function __wbg_handle_catch(e) {
    if (e instanceof WebAssembly.Exception && e.is(__wbindgen_wrapped_jstag)) {
        throw e.getArg(__wbindgen_wrapped_jstag, 0);
    }
    getInt32ArrayMemory0()[__wbg_terminated_addr] = 1; try { if (__ksOnTerminated) __ksOnTerminated(e); } catch (_) {}
    __wbg_call_abort_hook();
    throw e;
}


function __wbg_call_guard() {
    __wbg_terminated_addr ??= wasm.__instance_terminated.value / 4;
    const flag = getInt32ArrayMemory0()[__wbg_terminated_addr];
    if (flag) {
        if (!__wbg_called_abort) {
            __wbg_call_abort_hook();
        }throw new Error('Module terminated');
    }
}
function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue______true_(arg0, arg1, arg2) {
    __wbg_call_guard();
    try {
        wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue______true_(arg0, arg1, arg2);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_(arg0, arg1, arg2) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_(arg0, arg1, arg2);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_____wasm_bindgen_850068d9710d5473___JsError___true_(arg0, arg1, arg2) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_____wasm_bindgen_850068d9710d5473___JsError___true_(arg0, arg1, arg2);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___js_sys_a6174709d61e686f___Function_fn_wasm_bindgen_850068d9710d5473___JsValue_____wasm_bindgen_850068d9710d5473___sys__Undefined___js_sys_a6174709d61e686f___Function_fn_wasm_bindgen_850068d9710d5473___JsValue_____wasm_bindgen_850068d9710d5473___sys__Undefined_______true_(arg0, arg1, arg2, arg3) {
    __wbg_call_guard();
    try {
        wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___js_sys_a6174709d61e686f___Function_fn_wasm_bindgen_850068d9710d5473___JsValue_____wasm_bindgen_850068d9710d5473___sys__Undefined___js_sys_a6174709d61e686f___Function_fn_wasm_bindgen_850068d9710d5473___JsValue_____wasm_bindgen_850068d9710d5473___sys__Undefined_______true_(arg0, arg1, arg2, arg3);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_(arg0, arg1, arg2, arg3) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_(arg0, arg1, arg2, arg3);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_(arg0, arg1, arg2, arg3, arg4) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_(arg0, arg1, arg2, arg3, arg4);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_(arg0, arg1, arg2, arg3, arg4, arg5) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__true_(arg0, arg1, arg2, arg3, arg4, arg5);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___f64__wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue___true_(arg0, arg1, arg2, arg3) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___f64__wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue___true_(arg0, arg1, arg2, arg3);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___f64__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue___true_(arg0, arg1, arg2, arg3, arg4) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___f64__wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue___true_(arg0, arg1, arg2, arg3, arg4);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

function wasm_bindgen_850068d9710d5473___convert__closures_____invoke___f64__f64__wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue___true_(arg0, arg1, arg2, arg3, arg4) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.wasm_bindgen_850068d9710d5473___convert__closures_____invoke___f64__f64__wasm_bindgen_850068d9710d5473___JsValue__core_8dd34efd9c5aaf13___result__Result_wasm_bindgen_850068d9710d5473___JsValue__wasm_bindgen_850068d9710d5473___JsValue___true_(arg0, arg1, arg2, arg3, arg4);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

const DomHandleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_domhandle_free(ptr, 1));
const KeyOutcomeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_keyoutcome_free(ptr, 1));
const ModePickerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_modepicker_free(ptr, 1));
const OmniFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_omni_free(ptr, 1));
const PickResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pickresult_free(ptr, 1));
const PressOutcomeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pressoutcome_free(ptr, 1));
const RuleStyleDeclarationStoreFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rulestyledeclarationstore_free(ptr, 1));
const SceneRasterizerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_scenerasterizer_free(ptr, 1));
const TtyRendererFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_ttyrenderer_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertChar(c) {
    if (typeof(c) === 'number' && (c >= 0x110000 || (c >= 0xD800 && c < 0xE000))) throw new Error(`expected a valid Unicode scalar value, found ${c}`);
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => wasm.__wbindgen_destroy_closure(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new __ksUint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_destroy_closure(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_destroy_closure(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

class PanicError extends Error {}
Object.defineProperty(PanicError.prototype, 'name', {
    value: 'PanicError',
});

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    __ksReflectApply(__ksUint8ArraySet, getUint8ArrayMemory0(), [arg, ptr / 1]);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedInt32ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('kitesurf_core_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
