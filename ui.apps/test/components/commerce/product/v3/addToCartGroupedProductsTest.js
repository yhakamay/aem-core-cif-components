/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2019 Adobe
 ~
 ~ Licensed under the Apache License, Version 2.0 (the "License");
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an "AS IS" BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
'use strict';

import AddToCart from '../../../../../src/main/content/jcr_root/apps/core/cif/components/commerce/product/v3/product/clientlib/js/addToCart.js';

describe('GroupedProduct', () => {
    describe('AddToCart', () => {
        let productRoot;
        let addToCartRoot;
        let pageRoot;

        before(() => {
            let body = document.querySelector('body');
            pageRoot = document.createElement('div');
            body.appendChild(pageRoot);
        });

        after(() => {
            pageRoot.parentNode.removeChild(pageRoot);
        });

        beforeEach(() => {
            while (pageRoot.firstChild) {
                pageRoot.removeChild(pageRoot.firstChild);
            }
            pageRoot.insertAdjacentHTML(
                'afterbegin',
                `<div data-cmp-is="product"  data-uid-cart data-grouped data-product-sku="my-grouped-product">
                    <section class="productFullDetail__title">
                        <h1 class="productFullDetail__productName">
                            <span role="name">My Grouped Product</span>
                        </h1>
                    </section>
                    <section class="productFullDetail__sku productFullDetail__section">
                        <h2 class="productFullDetail__skuTitle productFullDetail__sectionTitle">SKU</h2>
                        <strong role="sku">my-grouped-product</strong>
                    </section>
                    <section class="productFullDetail__actions productFullDetail__section">
                        <button class="button__root_highPriority" data-cmp-is="add-to-cart">Add to cart</button>
                    </section>
                    <section class="productFullDetail__groupedProducts productFullDetail__quantity">
                        <select data-product-sku="sku1">
                            <option value="0" selected></option>
                            <option value="1"></option>
                        </select>
                        <select data-product-sku="sku2">
                            <option value="0" selected></option>
                            <option value="1"></option>
                        </select>
                        <select data-product-sku="sku3">
                            <option value="0" selected></option>
                            <option value="1"></option>
                        </select>
                        <select data-product-sku="sku4" data-virtual>
                            <option value="0" selected></option>
                            <option value="1"></option>
                        </select>
                    </section>
                </div>`
            );

            addToCartRoot = pageRoot.querySelector(AddToCart.selectors.self);
            productRoot = pageRoot.querySelector(AddToCart.selectors.product);
        });

        it('initializes an AddToCart component for a grouped product', () => {
            let addToCart = new AddToCart({ element: addToCartRoot, product: productRoot });
            assert.isTrue(addToCartRoot.disabled);
        });

        it('enables/disables AddToCart button based on quantity selection', () => {
            let addToCart = new AddToCart({ element: addToCartRoot, product: productRoot });
            let selections = Array.from(pageRoot.querySelectorAll(AddToCart.selectors.quantity));

            // Select quantity "1" for first product
            selections[0].value = '1';
            selections[0].dispatchEvent(new Event('change'));
            assert.isFalse(addToCartRoot.disabled, 'addToCartRoot is disabled');

            // Select quantity "0" for first product
            selections[0].selectedIndex = 0;
            selections[0].dispatchEvent(new Event('change'));
            assert.isTrue(addToCartRoot.disabled, 'addToCartRoot is not disabled');
        });

        it('dispatches add-to-cart event on click', () => {
            let spy = sinon.spy();
            document.addEventListener('aem.cif.add-to-cart', spy);

            let addToCart = new AddToCart({ element: addToCartRoot, product: productRoot });
            let selections = Array.from(pageRoot.querySelectorAll(AddToCart.selectors.quantity));

            // Select quantity "1" for two products
            selections[0].selectedIndex = 1;
            selections[2].selectedIndex = 1;
            selections[0].dispatchEvent(new Event('change'));
            assert.isFalse(addToCartRoot.disabled);
            addToCartRoot.click();

            sinon.assert.calledOnce(spy);
            let event = spy.getCall(0).args[0];
            assert.equal(event.type, AddToCart.events.addToCart);
            assert.equal(event.detail.length, 2);
            assert.equal(event.detail[0].sku, 'sku1');
            assert.equal(event.detail[0].quantity, 1);
            assert.equal(event.detail[1].sku, 'sku3');
            assert.equal(event.detail[1].quantity, 1);
        });

        it('dispatches add-to-cart event with virtual product on click', () => {
            let spy = sinon.spy();
            document.addEventListener('aem.cif.add-to-cart', spy);

            let addToCart = new AddToCart({ element: addToCartRoot, product: productRoot });
            let selections = Array.from(pageRoot.querySelectorAll(AddToCart.selectors.quantity));

            // Select quantity "1" for two products
            selections[0].selectedIndex = 1;
            selections[3].selectedIndex = 1;
            selections[0].dispatchEvent(new Event('change'));
            assert.isFalse(addToCartRoot.disabled);
            addToCartRoot.click();

            sinon.assert.calledOnce(spy);
            let event = spy.getCall(0).args[0];
            assert.equal(event.type, AddToCart.events.addToCart);
            assert.equal(event.detail.length, 2);
            assert.equal(event.detail[0].sku, 'sku1');
            assert.equal(event.detail[0].quantity, 1);
            assert.isFalse(event.detail[0].virtual);
            assert.equal(event.detail[1].sku, 'sku4');
            assert.equal(event.detail[1].quantity, 1);
            assert.isTrue(event.detail[1].virtual);
        });
    });
});
